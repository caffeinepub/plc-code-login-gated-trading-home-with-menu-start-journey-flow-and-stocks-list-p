import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Float "mo:core/Float";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";

import MixinStorage "blob-storage/Mixin";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type PortfolioEntry = {
    coin : Text;
    amount : Float;
  };

  public type UserProfile = {
    name : Text;
    referralCode : Text;
    portfolio : [PortfolioEntry];
    referred : [Principal];
  };

  public type PaymentStatus = {
    #pending;
    #verified;
    #rejected;
  };

  public type PaymentSubmission = {
    utr : Text;
    amount : Float;
    paymentMethod : Text;
    screenshotBlobId : Text;
    timestamp : Nat;
    status : PaymentStatus;
  };

  public type WithdrawalStatus = {
    #pending;
    #verified;
    #rejected;
  };

  public type WithdrawalRequest = {
    amount : Float;
    coin : Text;
    address : Text;
    timestamp : Nat;
    status : WithdrawalStatus;
  };

  public type TicketStatus = {
    #open;
    #closed;
  };

  public type SupportTicket = {
    owner : Principal;
    subject : Text;
    message : Text;
    ticketId : Nat;
    timestamp : Nat;
    status : TicketStatus;
    replies : [TicketReply];
  };

  public type TicketReply = {
    sender : Principal;
    message : Text;
    timestamp : Nat;
  };

  public type KycDocumentType = {
    #aadhaar;
    #pan;
  };

  public type KycStatus = {
    #pending;
    #verified;
    #rejected;
  };

  public type KycSubmission = {
    owner : Principal;
    documentType : KycDocumentType;
    documentNumber : Text;
    status : KycStatus;
    submittedAtTimestamp : Nat;
    verifiedAtTimestamp : ?Nat;
    blobId : Text;
    comments : Text;
    rejectionReason : Text;
  };

  public type PriceAlert = {
    user : Principal;
    coin : Text;
    targetPrice : Float;
    createdAtTimestamp : Nat;
    alertId : Nat;
    status : PriceAlertStatus;
  };

  public type PriceAlertStatus = {
    #active;
    #triggered;
  };

  public type LoginActivity = {
    user : Principal;
    timestamp : Nat;
    ipAddress : Text;
    provider : Text;
    deviceDetails : Text;
  };

  public type AchievementType = {
    #first_deposit;
    #five_referrals;
    #ten_k_invested;
    #ten_spins;
    #first_withdrawal;
    #profile_complete;
    #kyc_verified;
  };

  public type Achievement = {
    achievementType : AchievementType;
    unlockedAtTimestamp : Nat;
  };

  public type VipTier = {
    #bronze;
    #silver;
    #gold;
    #platinum;
  };

  public type VipTierInfo = {
    tier : VipTier;
    totalVerifiedDeposits : Float;
  };

  public type ReferralStats = {
    totalReferrals : Nat;
    totalReferralPayouts : Float;
  };

  public type StockPlan = {
    name : Text;
    price : Float;
    commission : Float;
    returns : Float;
    currency : Text;
    active : Bool;
    createdAtTimestamp : Nat;
    planId : Nat;
    totalUsers : Nat;
  };

  func arrayToList<T>(array : [T]) : List.List<T> {
    let iter = array.values();
    let list = List.empty<T>();
    for (element in iter) {
      list.add(element);
    };
    list;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let paymentSubmissions = Map.empty<Principal, List.List<PaymentSubmission>>();
  let withdrawalRequests = Map.empty<Principal, List.List<WithdrawalRequest>>();
  let tickets = Map.empty<Nat, SupportTicket>();
  let kycSubmissions = Map.empty<Principal, KycSubmission>();
  let priceAlerts = Map.empty<Principal, List.List<PriceAlert>>();
  let loginActivities = Map.empty<Principal, List.List<LoginActivity>>();
  let userAchievements = Map.empty<Principal, List.List<Achievement>>();
  let userStocks = Map.empty<Principal, List.List<StockPlan>>();
  let referralStats = Map.empty<Principal, ReferralStats>();

  // ─── Phone-keyed public user registry (no role required) ─────────────────────
  public type RegisteredUser = {
    name : Text;
    phone : Text;
    uniqueId : Text;
    balance : Float;
    frozen : Bool;
    registeredAt : Nat;
  };

  let registeredUsers = Map.empty<Text, RegisteredUser>();
  var maintenanceModeOn : Bool = false;

  var nextTicketId = 0;
  var nextAlertId = 0;
  var nextPlanId = 0;

  public shared ({ caller }) func createReferralCode(referralCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create referral codes");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          referralCode;
          portfolio = profile.portfolio;
          referred = profile.referred;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func registerReferral(referrerCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register referrals");
    };

    var referrer : ?Principal = null;

    for ((principal, profile) in userProfiles.entries()) {
      if (profile.referralCode == referrerCode) {
        referrer := ?principal;
      };
    };

    switch (referrer) {
      case (null) { Runtime.trap("Referrer not found") };
      case (?referrerPrincipal) {
        switch (userProfiles.get(referrerPrincipal)) {
          case (null) { Runtime.trap("Referrer profile not found") };
          case (?referrerProfile) {
            let referredList = arrayToList(referrerProfile.referred);
            referredList.add(caller);

            let updatedProfile : UserProfile = {
              name = referrerProfile.name;
              referralCode = referrerProfile.referralCode;
              portfolio = referrerProfile.portfolio;
              referred = referredList.toArray();
            };
            userProfiles.add(referrerPrincipal, updatedProfile);
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    profile : UserProfile,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitPayment(
    utr : Text,
    amount : Float,
    paymentMethod : Text,
    screenshotBlobId : Text,
    timestamp : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit payments");
    };

    let payment : PaymentSubmission = {
      utr;
      amount;
      paymentMethod;
      screenshotBlobId;
      timestamp;
      status = #pending;
    };

    let userPayments = switch (paymentSubmissions.get(caller)) {
      case (null) { List.empty<PaymentSubmission>() };
      case (?payments) { payments };
    };

    userPayments.add(payment);
    paymentSubmissions.add(caller, userPayments);
  };

  public query ({ caller }) func getAllPayments() : async [(Principal, [PaymentSubmission])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };

    paymentSubmissions.entries().map<(Principal, List.List<PaymentSubmission>), (Principal, [PaymentSubmission])>(func(entry) { (entry.0, entry.1.values().toArray()) }).toArray();
  };

  public shared ({ caller }) func updatePaymentStatus(
    user : Principal,
    utr : Text,
    newStatus : PaymentStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };

    switch (paymentSubmissions.get(user)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payments) {
        let updatedPayments = payments.map<PaymentSubmission, PaymentSubmission>(
          func(p : PaymentSubmission) : PaymentSubmission {
            if (Text.equal(p.utr, utr)) {
              {
                utr = p.utr;
                amount = p.amount;
                paymentMethod = p.paymentMethod;
                screenshotBlobId = p.screenshotBlobId;
                timestamp = p.timestamp;
                status = newStatus;
              };
            } else {
              p;
            };
          },
        );
        paymentSubmissions.add(user, updatedPayments);
      };
    };
  };

  public query ({ caller }) func getUserPayments() : async [PaymentSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their payments");
    };

    switch (paymentSubmissions.get(caller)) {
      case (null) { [] };
      case (?payments) { payments.values().toArray() };
    };
  };

  public query ({ caller }) func getUserBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their balance");
    };

    calculateBalance(caller);
  };

  public query ({ caller }) func getBalance(user : Principal) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view any user's balance");
    };

    calculateBalance(user);
  };

  func calculateBalance(user : Principal) : Float {
    switch (paymentSubmissions.get(user)) {
      case (null) { 0.0 };
      case (?payments) {
        payments.foldLeft(
          0.0,
          func(acc : Float, p : PaymentSubmission) : Float {
            switch (p.status) {
              case (#verified) { acc + p.amount };
              case (_) { acc };
            };
          },
        );
      };
    };
  };

  public shared ({ caller }) func submitWithdrawalRequest(
    amount : Float,
    coin : Text,
    address : Text,
    timestamp : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawal requests");
    };

    let request : WithdrawalRequest = {
      amount;
      coin;
      address;
      timestamp;
      status = #pending;
    };

    let userRequests = switch (withdrawalRequests.get(caller)) {
      case (null) { List.empty<WithdrawalRequest>() };
      case (?requests) { requests };
    };

    userRequests.add(request);
    withdrawalRequests.add(caller, userRequests);
  };

  public query ({ caller }) func getUserWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their withdrawals");
    };

    switch (withdrawalRequests.get(caller)) {
      case (null) { [] };
      case (?requests) { requests.values().toArray() };
    };
  };

  public query ({ caller }) func getAllWithdrawals() : async [(Principal, [WithdrawalRequest])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };

    withdrawalRequests.entries().map<(Principal, List.List<WithdrawalRequest>), (Principal, [WithdrawalRequest])>(func(entry) { (entry.0, entry.1.values().toArray()) }).toArray();
  };

  public shared ({ caller }) func updateWithdrawalStatus(
    user : Principal,
    timestamp : Nat,
    newStatus : WithdrawalStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update withdrawal status");
    };

    switch (withdrawalRequests.get(user)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?requests) {
        let updatedRequests = requests.map<WithdrawalRequest, WithdrawalRequest>(
          func(r : WithdrawalRequest) : WithdrawalRequest {
            if (r.timestamp == timestamp) {
              {
                amount = r.amount;
                coin = r.coin;
                address = r.address;
                timestamp = r.timestamp;
                status = newStatus;
              };
            } else {
              r;
            };
          },
        );
        withdrawalRequests.add(user, updatedRequests);
      };
    };
  };

  public shared ({ caller }) func submitSupportTicket(subject : Text, message : Text, timestamp : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit support tickets");
    };

    let ticketId = nextTicketId;
    nextTicketId += 1;

    let ticket : SupportTicket = {
      owner = caller;
      subject;
      message;
      ticketId;
      timestamp;
      status = #open;
      replies = [];
    };

    tickets.add(ticketId, ticket);
    ticketId;
  };

  public shared ({ caller }) func replyToTicket(ticketId : Nat, message : Text, timestamp : Nat) : async () {
    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        if (ticket.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot reply to this ticket");
        };
        let reply : TicketReply = {
          sender = caller;
          message;
          timestamp;
        };
        let repliesList = arrayToList<TicketReply>(ticket.replies);
        repliesList.add(reply);

        let updatedTicket : SupportTicket = {
          owner = ticket.owner;
          subject = ticket.subject;
          message = ticket.message;
          ticketId = ticket.ticketId;
          timestamp = ticket.timestamp;
          status = ticket.status;
          replies = repliesList.toArray();
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func closeTicket(ticketId : Nat) : async () {
    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        if (ticket.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot close this ticket");
        };
        let updatedTicket : SupportTicket = {
          owner = ticket.owner;
          subject = ticket.subject;
          message = ticket.message;
          ticketId = ticket.ticketId;
          timestamp = ticket.timestamp;
          status = #closed;
          replies = ticket.replies;
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
  };

  public query ({ caller }) func getUserTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their tickets");
    };

    let userTickets = List.empty<SupportTicket>();
    for (ticket in tickets.values()) {
      if (ticket.owner == caller) {
        userTickets.add(ticket);
      };
    };
    userTickets.toArray();
  };

  public query ({ caller }) func getAllTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all tickets");
    };

    let iter = tickets.values();
    let ticketList = List.empty<SupportTicket>();
    for (ticket in iter) {
      ticketList.add(ticket);
    };
    ticketList.toArray();
  };

  public shared ({ caller }) func updatePortfolio(coin : Text, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update portfolio");
    };

    let entry : PortfolioEntry = {
      coin;
      amount;
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let portfolioList = arrayToList<PortfolioEntry>(profile.portfolio);
        var updated : Bool = false;

        let newPortfolio = portfolioList.map<PortfolioEntry, PortfolioEntry>(
          func(p : PortfolioEntry) {
            if (p.coin == coin) {
              updated := true;
              entry;
            } else {
              p;
            }
          }
        );

        if (not updated) {
          let newPortfolioList = newPortfolio;
          newPortfolioList.add(entry);
          let updatedProfile : UserProfile = {
            name = profile.name;
            referralCode = profile.referralCode;
            portfolio = newPortfolioList.toArray();
            referred = profile.referred;
          };
          userProfiles.add(caller, updatedProfile);
        } else {
          let updatedProfile : UserProfile = {
            name = profile.name;
            referralCode = profile.referralCode;
            portfolio = newPortfolio.toArray();
            referred = profile.referred;
          };
          userProfiles.add(caller, updatedProfile);
        };
      };
    };
  };

  public shared ({ caller }) func submitKyc(documentType : KycDocumentType, documentNumber : Text, blobId : Text, comments : Text, timestamp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC");
    };

    let kyc : KycSubmission = {
      owner = caller;
      documentType;
      documentNumber;
      submittedAtTimestamp = timestamp;
      status = #pending;
      verifiedAtTimestamp = null;
      blobId;
      comments;
      rejectionReason = "";
    };

    kycSubmissions.add(caller, kyc);
  };

  public shared ({ caller }) func updateKycStatus(user : Principal, newStatus : KycStatus, rejectionReason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update KYC status");
    };

    switch (kycSubmissions.get(user)) {
      case (null) { Runtime.trap("KYC submission not found") };
      case (?kyc) {
        let updatedKyc : KycSubmission = {
          kyc with
          status = newStatus;
          verifiedAtTimestamp = ?Int.abs(Time.now());
          rejectionReason;
        };
        kycSubmissions.add(user, updatedKyc);
      };
    };
  };

  public query ({ caller }) func getKycStatus() : async KycStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KYC status");
    };

    switch (kycSubmissions.get(caller)) {
      case (null) { Runtime.trap("KYC submission not found") };
      case (?kyc) { kyc.status };
    };
  };

  public shared ({ caller }) func createPriceAlert(coin : Text, targetPrice : Float, timestamp : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create price alerts");
    };

    let alertId = nextAlertId;
    nextAlertId += 1;

    let alert : PriceAlert = {
      user = caller;
      coin;
      targetPrice;
      createdAtTimestamp = timestamp;
      alertId;
      status = #active;
    };

    let userAlerts = switch (priceAlerts.get(caller)) {
      case (null) { List.empty<PriceAlert>() };
      case (?alerts) { alerts };
    };

    userAlerts.add(alert);
    priceAlerts.add(caller, userAlerts);
    alertId;
  };

  public shared ({ caller }) func deletePriceAlert(alertId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete price alerts");
    };

    let userAlerts = switch (priceAlerts.get(caller)) {
      case (null) { Runtime.trap("No alerts found for user") };
      case (?alerts) { alerts };
    };

    var found = false;
    let alertsList = List.empty<PriceAlert>();
    for (alert in userAlerts.values()) {
      if (alert.alertId == alertId) {
        if (alert.user != caller) {
          Runtime.trap("Unauthorized: Cannot delete another user's alert");
        };
        found := true;
      } else {
        alertsList.add(alert);
      };
    };

    if (not found) {
      Runtime.trap("Alert not found");
    };

    priceAlerts.add(caller, alertsList);
  };

  public shared ({ caller }) func recordLoginActivity(ip : Text, provider : Text, deviceDetails : Text, timestamp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record login activity");
    };

    let login : LoginActivity = {
      user = caller;
      timestamp;
      ipAddress = ip;
      provider;
      deviceDetails;
    };

    let userLogins = switch (loginActivities.get(caller)) {
      case (null) { List.empty<LoginActivity>() };
      case (?logins) { logins };
    };

    userLogins.add(login);
    loginActivities.add(caller, userLogins);
  };

  public query ({ caller }) func getLastLogins() : async [LoginActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view login activity");
    };

    switch (loginActivities.get(caller)) {
      case (null) { [] };
      case (?logins) { logins.toArray() };
    };
  };

  public shared ({ caller }) func unlockAchievement(achievementType : AchievementType, timestamp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock achievements");
    };

    let achievement : Achievement = {
      achievementType;
      unlockedAtTimestamp = timestamp;
    };

    let userAchievementsList = switch (userAchievements.get(caller)) {
      case (null) { List.empty<Achievement>() };
      case (?achievements) { achievements };
    };

    var alreadyUnlocked = false;
    for (existing in userAchievementsList.values()) {
      if (existing.achievementType == achievementType) {
        alreadyUnlocked := true;
      };
    };

    if (not alreadyUnlocked) {
      userAchievementsList.add(achievement);
      userAchievements.add(caller, userAchievementsList);
    };
  };

  public query ({ caller }) func getVipTier() : async VipTierInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view VIP tier");
    };

    let totalDeposits = calculateVerifiedDeposits(caller);

    let tier : VipTier = if (totalDeposits >= 50000.0) {
      #platinum;
    } else if (totalDeposits >= 20000.0) {
      #gold;
    } else if (totalDeposits >= 5000.0) {
      #silver;
    } else {
      #bronze;
    };

    {
      tier;
      totalVerifiedDeposits = totalDeposits;
    };
  };

  func calculateVerifiedDeposits(user : Principal) : Float {
    switch (paymentSubmissions.get(user)) {
      case (null) { 0.0 };
      case (?payments) {
        payments.foldLeft(
          0.0,
          func(acc : Float, p : PaymentSubmission) : Float {
            switch (p.status) {
              case (#verified) { acc + p.amount };
              case (_) { acc };
            };
          },
        );
      };
    };
  };

  public shared ({ caller }) func createStockPlan(name : Text, price : Float, commission : Float, returns : Float, currency : Text, timestamp : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create stock plans");
    };

    let planId = nextPlanId;
    nextPlanId += 1;

    let plan : StockPlan = {
      name;
      price;
      commission;
      returns;
      currency;
      active = true;
      createdAtTimestamp = timestamp;
      planId;
      totalUsers = 0;
    };

    let adminStocks = switch (userStocks.get(caller)) {
      case (null) { List.empty<StockPlan>() };
      case (?stocks) { stocks };
    };

    adminStocks.add(plan);
    userStocks.add(caller, adminStocks);
    planId;
  };

  public shared ({ caller }) func buyStock(planId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy stocks");
    };

    let allStocks = List.empty<StockPlan>();
    for (stocks in userStocks.values()) {
      for (stock in stocks.values()) {
        allStocks.add(stock);
      };
    };

    let planToBuyList = List.empty<StockPlan>();
    for (stock in allStocks.values()) {
      if (stock.planId == planId and stock.active) {
        planToBuyList.add(stock);
      };
    };

    let planToBuy = planToBuyList.toArray();

    if (planToBuy.size() == 0) {
      Runtime.trap("Stock plan not found or inactive");
    };

    let userStocksList = switch (userStocks.get(caller)) {
      case (null) { List.empty<StockPlan>() };
      case (?stocks) { stocks };
    };

    userStocksList.add(planToBuy[0]);
    userStocks.add(caller, userStocksList);
  };

  // ─── Admin: Get All User Profiles ────────────────────────────────────────────

  public type UserProfileWithPrincipal = {
    principal : Principal;
    name : Text;
    referralCode : Text;
    portfolio : [PortfolioEntry];
    referred : [Principal];
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfileWithPrincipal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    let result = List.empty<UserProfileWithPrincipal>();
    for ((principal, profile) in userProfiles.entries()) {
      result.add({
        principal;
        name = profile.name;
        referralCode = profile.referralCode;
        portfolio = profile.portfolio;
        referred = profile.referred;
      });
    };
    result.toArray();
  };

  // ─── Admin: Get All KYC Submissions ──────────────────────────────────────────

  public query ({ caller }) func getAllKycSubmissions() : async [KycSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all KYC submissions");
    };
    let result = List.empty<KycSubmission>();
    for (kyc in kycSubmissions.values()) {
      result.add(kyc);
    };
    result.toArray();
  };

  // ─── Public: Phone-keyed User Registry (no role required) ────────────────────

  // Any caller can register a user by phone number (idempotent - won't overwrite existing)
  public shared func registerUserByPhone(phone : Text, name : Text, uniqueId : Text, timestamp : Nat) : async () {
    switch (registeredUsers.get(phone)) {
      case (?_existing) {
        // Already registered - do nothing (idempotent)
      };
      case (null) {
        registeredUsers.add(phone, {
          name;
          phone;
          uniqueId;
          balance = 0.0;
          frozen = false;
          registeredAt = timestamp;
        });
      };
    };
  };

  // Get a single registered user by phone
  public query func getRegisteredUserByPhone(phone : Text) : async ?RegisteredUser {
    registeredUsers.get(phone);
  };

  // Admin: get all registered users (no role check - uses admin PIN from frontend)
  public query func getAllRegisteredUsers() : async [RegisteredUser] {
    let result = List.empty<RegisteredUser>();
    for (u in registeredUsers.values()) {
      result.add(u);
    };
    result.toArray();
  };

  // Admin: update user balance by phone
  public shared func updateRegisteredUserBalance(phone : Text, newBalance : Float) : async () {
    switch (registeredUsers.get(phone)) {
      case (?u) {
        registeredUsers.add(phone, {
          name = u.name;
          phone = u.phone;
          uniqueId = u.uniqueId;
          balance = newBalance;
          frozen = u.frozen;
          registeredAt = u.registeredAt;
        });
      };
      case (null) {};
    };
  };

  // Admin: freeze or unfreeze a user by phone
  public shared func setUserFrozenByPhone(phone : Text, frozen : Bool) : async () {
    switch (registeredUsers.get(phone)) {
      case (?u) {
        registeredUsers.add(phone, {
          name = u.name;
          phone = u.phone;
          uniqueId = u.uniqueId;
          balance = u.balance;
          frozen;
          registeredAt = u.registeredAt;
        });
      };
      case (null) {};
    };
  };

  // Public: check if a user is frozen by phone
  public query func isUserFrozenByPhone(phone : Text) : async Bool {
    switch (registeredUsers.get(phone)) {
      case (?u) { u.frozen };
      case (null) { false };
    };
  };

  // Admin: maintenance mode
  public shared func setMaintenanceMode(on : Bool) : async () {
    maintenanceModeOn := on;
  };

  public query func getMaintenanceMode() : async Bool {
    maintenanceModeOn;
  };

};

