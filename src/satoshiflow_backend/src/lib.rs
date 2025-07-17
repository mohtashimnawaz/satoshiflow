use ic_cdk::api::caller;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct CancelResult {
    refund: u64,
    fee: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum ClaimResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum TopUpResult {
    #[serde(rename = "ok")]
    Ok(()),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum CancelStreamResult {
    #[serde(rename = "ok")]
    Ok(CancelResult),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum ReclaimResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

// Stream status
#[derive(Clone, Debug, PartialEq, CandidType, Serialize, Deserialize)]
enum StreamStatus {
    Active,
    Paused,
    Cancelled,
    Completed,
}

// Stream struct
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Stream {
    id: u64,
    sender: Principal,
    recipient: Principal,
    sats_per_sec: u64,
    start_time: u64,
    end_time: u64,
    total_locked: u64,
    total_released: u64,
    last_release_time: u64,
    buffer: u64,
    status: StreamStatus,
    last_claim_time: u64,
    // New metadata fields
    title: Option<String>,
    description: Option<String>,
    tags: Vec<String>,
    metadata: HashMap<String, String>,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct StreamTemplate {
    id: u64,
    name: String,
    description: String,
    duration_secs: u64,
    sats_per_sec: u64,
    creator: Principal,
    created_at: u64,
    usage_count: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum TemplateResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

// Notification system
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum NotificationType {
    StreamCreated,
    StreamClaimed,
    StreamTopUp,
    StreamCancelled,
    StreamCompleted,
    LowBalance,
    ClaimReminder,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Notification {
    id: u64,
    user: Principal,
    stream_id: u64,
    notification_type: NotificationType,
    message: String,
    timestamp: u64,
    read: bool,
}

// Statistics and analytics
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct StreamStats {
    total_streams_created: u64,
    total_volume_locked: u64,
    total_volume_claimed: u64,
    active_streams: u64,
    completed_streams: u64,
    cancelled_streams: u64,
    average_stream_duration: u64,
    total_fees_collected: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct UserStats {
    user: Principal,
    streams_created: u64,
    streams_received: u64,
    total_sent: u64,
    total_received: u64,
    total_fees_paid: u64,
    avg_stream_size: u64,
}

// Storage for streams
thread_local! {
    static STREAMS: std::cell::RefCell<HashMap<u64, Stream>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

// Storage for templates
thread_local! {
    static TEMPLATES: std::cell::RefCell<HashMap<u64, StreamTemplate>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_TEMPLATE_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

// Storage for notifications
thread_local! {
    static NOTIFICATIONS: std::cell::RefCell<HashMap<u64, Notification>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_NOTIFICATION_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

// Storage for stats
thread_local! {
    static GLOBAL_STATS: std::cell::RefCell<StreamStats> = std::cell::RefCell::new(StreamStats {
        total_streams_created: 0,
        total_volume_locked: 0,
        total_volume_claimed: 0,
        active_streams: 0,
        completed_streams: 0,
        cancelled_streams: 0,
        average_stream_duration: 0,
        total_fees_collected: 0,
    });
    static USER_STATS: std::cell::RefCell<HashMap<Principal, UserStats>> = std::cell::RefCell::new(HashMap::new());
}

const FEE_PERCENT: f64 = 0.01; // 1% fee
const RECLAIM_TIMEOUT_SECS: u64 = 7 * 24 * 60 * 60; // 7 days

#[ic_cdk::update]
fn create_stream(
    recipient: Principal,
    sats_per_sec: u64,
    duration_secs: u64,
    total_locked: u64,
    title: Option<String>,
    description: Option<String>,
    tags: Vec<String>,
) -> u64 {
    let sender = caller();
    let start_time = ic_cdk::api::time() / 1_000_000_000; // seconds
    let end_time = start_time + duration_secs;
    let id = NEXT_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    let stream = Stream {
        id,
        sender,
        recipient,
        sats_per_sec,
        start_time,
        end_time,
        total_locked,
        total_released: 0,
        last_release_time: start_time,
        buffer: 0,
        status: StreamStatus::Active,
        last_claim_time: start_time,
        title,
        description,
        tags,
        metadata: HashMap::new(),
    };
    STREAMS.with(|streams| {
        streams.borrow_mut().insert(id, stream);
    });
    update_stats_on_create(sender, total_locked, duration_secs);
    create_notification(sender, id, NotificationType::StreamCreated, "Stream created successfully".to_string());
    id
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[ic_cdk::heartbeat]
fn canister_heartbeat() {
    let now = ic_cdk::api::time() / 1_000_000_000; // seconds
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        for stream in streams.values_mut() {
            if stream.status != StreamStatus::Active {
                continue;
            }
            let elapsed = now.saturating_sub(stream.last_release_time);
            if elapsed == 0 {
                continue;
            }
            let releasable = elapsed * stream.sats_per_sec;
            let remaining = stream.total_locked.saturating_sub(stream.total_released);
            let to_release = releasable.min(remaining);
            stream.total_released += to_release;
            stream.last_release_time = now;
            stream.buffer += to_release;
            
            // Check milestones
            check_and_execute_milestones(stream.id, stream.total_released);
            
            if stream.total_released >= stream.total_locked || now >= stream.end_time {
                stream.status = StreamStatus::Completed;
                create_notification(stream.sender, stream.id, NotificationType::StreamCompleted, "Stream completed".to_string());
                create_notification(stream.recipient, stream.id, NotificationType::StreamCompleted, "Stream completed".to_string());
            }
        }
    });
}

#[ic_cdk::update]
fn claim_stream(stream_id: u64) -> ClaimResult {
    let caller = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => ClaimResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.recipient != caller {
                    return ClaimResult::Err("Only the recipient can claim".to_string());
                }
                if stream.buffer == 0 {
                    return ClaimResult::Err("No funds to claim".to_string());
                }
                let claimed = stream.buffer;
                stream.buffer = 0;
                stream.last_claim_time = now;
                ClaimResult::Ok(claimed)
            }
        }
    })
}

#[ic_cdk::update]
fn top_up_stream(stream_id: u64, additional_sats: u64) -> TopUpResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => TopUpResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return TopUpResult::Err("Only the sender can top up".to_string());
                }
                if stream.status != StreamStatus::Active {
                    return TopUpResult::Err("Stream is not active".to_string());
                }
                stream.total_locked += additional_sats;
                TopUpResult::Ok(())
            }
        }
    })
}

#[ic_cdk::update]
fn cancel_stream(stream_id: u64) -> CancelStreamResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => CancelStreamResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return CancelStreamResult::Err("Only the sender can cancel".to_string());
                }
                if stream.status != StreamStatus::Active {
                    return CancelStreamResult::Err("Stream is not active".to_string());
                }
                stream.status = StreamStatus::Cancelled;
                let unused = stream.total_locked.saturating_sub(stream.total_released);
                let fee = (unused as f64 * FEE_PERCENT).round() as u64;
                let refund = unused.saturating_sub(fee);
                CancelStreamResult::Ok(CancelResult { refund, fee })
            }
        }
    })
}

#[ic_cdk::update]
fn reclaim_unclaimed(stream_id: u64) -> ReclaimResult {
    let caller = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => ReclaimResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return ReclaimResult::Err("Only the sender can reclaim".to_string());
                }
                if stream.buffer == 0 {
                    return ReclaimResult::Err("No unclaimed funds to reclaim".to_string());
                }
                let claimable_time = stream.end_time.max(stream.last_claim_time) + RECLAIM_TIMEOUT_SECS;
                if now < claimable_time {
                    return ReclaimResult::Err("Reclaim timeout not reached".to_string());
                }
                let reclaimed = stream.buffer;
                stream.buffer = 0;
                ReclaimResult::Ok(reclaimed)
            }
        }
    })
}

#[ic_cdk::query]
fn get_stream(stream_id: u64) -> Option<Stream> {
    STREAMS.with(|streams| streams.borrow().get(&stream_id).cloned())
}

#[ic_cdk::query]
fn list_streams_for_user(user: Principal) -> Vec<Stream> {
    STREAMS.with(|streams| {
        streams
            .borrow()
            .values()
            .filter(|s| s.sender == user || s.recipient == user)
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_notifications() -> Vec<Notification> {
    let user = caller();
    NOTIFICATIONS.with(|notifications| {
        notifications
            .borrow()
            .values()
            .filter(|n| n.user == user)
            .cloned()
            .collect()
    })
}

#[ic_cdk::update]
fn mark_notification_read(notification_id: u64) -> bool {
    let user = caller();
    NOTIFICATIONS.with(|notifications| {
        let mut notifications = notifications.borrow_mut();
        if let Some(notification) = notifications.get_mut(&notification_id) {
            if notification.user == user {
                notification.read = true;
                return true;
            }
        }
        false
    })
}

fn update_stats_on_create(sender: Principal, total_locked: u64, duration: u64) {
    GLOBAL_STATS.with(|stats| {
        let mut stats = stats.borrow_mut();
        stats.total_streams_created += 1;
        stats.total_volume_locked += total_locked;
        stats.active_streams += 1;
        stats.average_stream_duration = (stats.average_stream_duration + duration) / 2;
    });
    
    USER_STATS.with(|user_stats| {
        let mut user_stats = user_stats.borrow_mut();
        let user_stat = user_stats.entry(sender).or_insert(UserStats {
            user: sender,
            streams_created: 0,
            streams_received: 0,
            total_sent: 0,
            total_received: 0,
            total_fees_paid: 0,
            avg_stream_size: 0,
        });
        user_stat.streams_created += 1;
        user_stat.total_sent += total_locked;
        user_stat.avg_stream_size = user_stat.total_sent / user_stat.streams_created;
    });
}

#[ic_cdk::query]
fn get_global_stats() -> StreamStats {
    GLOBAL_STATS.with(|stats| stats.borrow().clone())
}

#[ic_cdk::query]
fn get_user_stats(user: Principal) -> Option<UserStats> {
    USER_STATS.with(|user_stats| user_stats.borrow().get(&user).cloned())
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum PauseResult {
    #[serde(rename = "ok")]
    Ok(()),
    #[serde(rename = "err")]
    Err(String),
}

#[ic_cdk::update]
fn pause_stream(stream_id: u64) -> PauseResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => PauseResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return PauseResult::Err("Only the sender can pause".to_string());
                }
                if stream.status != StreamStatus::Active {
                    return PauseResult::Err("Stream is not active".to_string());
                }
                stream.status = StreamStatus::Paused;
                PauseResult::Ok(())
            }
        }
    })
}

#[ic_cdk::update]
fn resume_stream(stream_id: u64) -> PauseResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => PauseResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return PauseResult::Err("Only the sender can resume".to_string());
                }
                if stream.status != StreamStatus::Paused {
                    return PauseResult::Err("Stream is not paused".to_string());
                }
                stream.status = StreamStatus::Active;
                stream.last_release_time = ic_cdk::api::time() / 1_000_000_000;
                PauseResult::Ok(())
            }
        }
    })
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum MilestoneAction {
    SendNotification(String),
    AutoClaim,
    PauseStream,
    TopUpStream(u64),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Milestone {
    id: u64,
    stream_id: u64,
    trigger_amount: u64, // Amount released to trigger this milestone
    action: MilestoneAction,
    triggered: bool,
    created_by: Principal,
}

// Storage for milestones
thread_local! {
    static MILESTONES: std::cell::RefCell<HashMap<u64, Milestone>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_MILESTONE_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

#[ic_cdk::update]
fn add_milestone(stream_id: u64, trigger_amount: u64, action: MilestoneAction) -> u64 {
    let creator = caller();
    let id = NEXT_MILESTONE_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    
    let milestone = Milestone {
        id,
        stream_id,
        trigger_amount,
        action,
        triggered: false,
        created_by: creator,
    };
    
    MILESTONES.with(|milestones| {
        milestones.borrow_mut().insert(id, milestone);
    });
    
    id
}

fn check_and_execute_milestones(stream_id: u64, current_released: u64) {
    MILESTONES.with(|milestones| {
        let mut milestones = milestones.borrow_mut();
        for milestone in milestones.values_mut() {
            if milestone.stream_id == stream_id 
                && !milestone.triggered 
                && current_released >= milestone.trigger_amount {
                
                milestone.triggered = true;
                match &milestone.action {
                    MilestoneAction::SendNotification(msg) => {
                        create_notification(
                            milestone.created_by,
                            stream_id,
                            NotificationType::StreamCreated,
                            msg.clone(),
                        );
                    }
                    MilestoneAction::AutoClaim => {
                        // Auto-claim logic would go here
                    }
                    MilestoneAction::PauseStream => {
                        // Auto-pause logic would go here
                    }
                    MilestoneAction::TopUpStream(_amount) => {
                        // Auto-topup logic would go here
                    }
                }
            }
        }
    });
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct StreamFilter {
    status: Option<StreamStatus>,
    min_amount: Option<u64>,
    max_amount: Option<u64>,
    min_duration: Option<u64>,
    max_duration: Option<u64>,
    sender: Option<Principal>,
    recipient: Option<Principal>,
    created_after: Option<u64>,
    created_before: Option<u64>,
}

#[ic_cdk::query]
fn search_streams(filter: StreamFilter) -> Vec<Stream> {
    let user = caller();
    STREAMS.with(|streams| {
        streams
            .borrow()
            .values()
            .filter(|s| {
                // User must be involved in the stream
                if s.sender != user && s.recipient != user {
                    return false;
                }
                
                // Apply filters
                if let Some(status) = &filter.status {
                    if s.status != *status {
                        return false;
                    }
                }
                
                if let Some(min_amount) = filter.min_amount {
                    if s.total_locked < min_amount {
                        return false;
                    }
                }
                
                if let Some(max_amount) = filter.max_amount {
                    if s.total_locked > max_amount {
                        return false;
                    }
                }
                
                if let Some(min_duration) = filter.min_duration {
                    if (s.end_time - s.start_time) < min_duration {
                        return false;
                    }
                }
                
                if let Some(max_duration) = filter.max_duration {
                    if (s.end_time - s.start_time) > max_duration {
                        return false;
                    }
                }
                
                if let Some(sender) = filter.sender {
                    if s.sender != sender {
                        return false;
                    }
                }
                
                if let Some(recipient) = filter.recipient {
                    if s.recipient != recipient {
                        return false;
                    }
                }
                
                if let Some(created_after) = filter.created_after {
                    if s.start_time < created_after {
                        return false;
                    }
                }
                
                if let Some(created_before) = filter.created_before {
                    if s.start_time > created_before {
                        return false;
                    }
                }
                
                true
            })
            .cloned()
            .collect()
    })
}

#[ic_cdk::update]
fn create_template(name: String, description: String, duration_secs: u64, sats_per_sec: u64) -> TemplateResult {
    let creator = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    
    let id = NEXT_TEMPLATE_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    
    let template = StreamTemplate {
        id,
        name,
        description,
        duration_secs,
        sats_per_sec,
        creator,
        created_at: now,
        usage_count: 0,
    };
    
    TEMPLATES.with(|templates| {
        templates.borrow_mut().insert(id, template);
    });
    
    TemplateResult::Ok(id)
}

#[ic_cdk::update]
fn create_stream_from_template(template_id: u64, recipient: Principal, total_locked: u64) -> u64 {
    TEMPLATES.with(|templates| {
        let mut templates = templates.borrow_mut();
        if let Some(template) = templates.get_mut(&template_id) {
            template.usage_count += 1;
            create_stream(recipient, template.sats_per_sec, template.duration_secs, total_locked, None, None, Vec::new())
        } else {
            0 // Handle error properly in real implementation
        }
    })
}

#[ic_cdk::query]
fn list_templates() -> Vec<StreamTemplate> {
    TEMPLATES.with(|templates| {
        templates.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_stream_stats(stream_id: u64) -> Option<StreamStats> {
    STREAMS.with(|streams| {
        if let Some(stream) = streams.borrow().get(&stream_id) {
            // Calculate basic stats for this specific stream
            let duration = stream.end_time - stream.start_time;
            let _completion_rate = if stream.total_locked > 0 {
                (stream.total_released as f64 / stream.total_locked as f64 * 100.0) as u64
            } else {
                0
            };
            
            Some(StreamStats {
                total_streams_created: 1,
                total_volume_locked: stream.total_locked,
                total_volume_claimed: stream.total_released - stream.buffer,
                active_streams: if stream.status == StreamStatus::Active { 1 } else { 0 },
                completed_streams: if stream.status == StreamStatus::Completed { 1 } else { 0 },
                cancelled_streams: if stream.status == StreamStatus::Cancelled { 1 } else { 0 },
                average_stream_duration: duration,
                total_fees_collected: 0, // Would need to calculate based on actual fees
            })
        } else {
            None
        }
    })
}

fn create_notification(user: Principal, stream_id: u64, notification_type: NotificationType, message: String) {
    let id = NEXT_NOTIFICATION_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    
    let notification = Notification {
        id,
        user,
        stream_id,
        notification_type,
        message,
        timestamp: ic_cdk::api::time() / 1_000_000_000,
        read: false,
    };
    
    NOTIFICATIONS.with(|notifications| {
        notifications.borrow_mut().insert(id, notification);
    });
}
