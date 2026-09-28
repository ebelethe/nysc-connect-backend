

--  users 
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('corps_member', 'landlord', 'admin') NOT NULL,
    isVerified BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 

--  corps_members
CREATE TABLE corps_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    callUpNumber VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

--  landlords
CREATE TABLE landlords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    idDocumentUrl VARCHAR(255),
    selfieUrl VARCHAR(255),
    verificationStatus ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

--  listings
CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    landlordId INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    LGA VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    roomType ENUM('single room', 'self-contained', 'flat', 'shared apartment') NOT NULL,
    description TEXT,
    amenities TEXT,
    status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft',
    deletedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (landlordId) REFERENCES landlords(id) ON DELETE CASCADE
);

--  listing_photos
CREATE TABLE listing_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listingId INT NOT NULL,
    photoUrl VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE
);

--  enquiries
CREATE TABLE enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listingId INT NOT NULL,
    corpsMemberId INT NOT NULL,
    message TEXT NOT NULL,
    reply TEXT NULL,
    repliedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE
);

--  posts (replaced - see communities/community_members below) 
-- CREATE TABLE posts (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--  corpsMemberId INT NOT NULL,
--    content TEXT NOT NULL,
--    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE
--);

-- . comments (replaced)
--CREATE TABLE comments (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    postId INT NOT NULL,
--    corpsMemberId INT NOT NULL,
--    content TEXT NOT NULL,
--    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
--    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE
--);

-- 9. likes (replaced)
--CREATE TABLE likes (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    postId INT NOT NULL,
--    corpsMemberId INT NOT NULL,
--    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
--    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE,
--    UNIQUE (postId, corpsMemberId)
--);

--  reports
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporterId INT NOT NULL,
    targetType ENUM('post', 'listing', 'member') NOT NULL,
    targetId INT NOT NULL,
    reason TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporterId) REFERENCES corps_members(id) ON DELETE CASCADE
);

-- ============================
-- otps
-- ============================
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose ENUM('signup_verification', 'password_reset') NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    isUsed BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================
-- NEW: communities
-- ============================
CREATE TABLE communities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state VARCHAR(50) NOT NULL,
    LGA VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rules TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (state, LGA)
);

-- ============================
-- NEW: community_members
-- ============================
CREATE TABLE community_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    communityId INT NOT NULL,
    corpsMemberId INT NOT NULL,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE,
    UNIQUE (communityId, corpsMemberId)
);

-- ============================
-- NEW: community_messages (Chatroom)
-- ============================
CREATE TABLE community_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    communityId INT NOT NULL,
    corpsMemberId INT NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (corpsMemberId) REFERENCES corps_members(id) ON DELETE CASCADE
);

-- ============================
-- NEW: direct_messages (DMs)
-- ============================
CREATE TABLE direct_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES corps_members(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES corps_members(id) ON DELETE CASCADE
);

-- ============================
-- NEW: blocks
-- ============================
CREATE TABLE blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blockerId INT NOT NULL,
    blockedId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blockerId) REFERENCES corps_members(id) ON DELETE CASCADE,
    FOREIGN KEY (blockedId) REFERENCES corps_members(id) ON DELETE CASCADE,
    UNIQUE (blockerId, blockedId)
);

CREATE TABLE blocked_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================
-- ALTER: listings — add badge, expand status
-- ============================
ALTER TABLE listings
    ADD COLUMN badge ENUM('document_verified', 'physically_inspected') NOT NULL DEFAULT 'document_verified',
    MODIFY COLUMN status ENUM('draft', 'pending_review', 'active', 'rented', 'suspended', 'rejected') NOT NULL DEFAULT 'draft';

-- ============================
-- ALTER: reports — add status + message snapshot
-- ============================
ALTER TABLE reports
    ADD COLUMN status ENUM('pending', 'resolved') NOT NULL DEFAULT 'pending',
    ADD COLUMN messageSnapshot TEXT NULL;

ALTER TABLE otps
    ADD COLUMN channel ENUM('email', 'sms') NOT NULL DEFAULT 'email';

ALTER TABLE users
      ADD COLUMN emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN phoneVerified BOOLEAN NOT NULL DEFAULT FALSE;


-- ============================
-- DROP: old community tables (being replaced)
-- ============================
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS posts;

ALTER TABLE landlords DROP COLUMN location;

ALTER TABLE landlords
    ADD COLUMN state VARCHAR(50) NULL,
    ADD COLUMN LGA VARCHAR(100) NULL,
    ADD COLUMN residentialAddress VARCHAR(255) NULL,
    ADD COLUMN profilePhotoUrl VARCHAR(255) NULL ;

    ALTER TABLE corps_members
    ADD COLUMN profilePhotoUrl VARCHAR(255) NULL;
    ADD COLUMN areasOfInterest VARCHAR(255) NULL,
    ADD COLUMN batch VARCHAR(20) NULL;
    ADD COLUMN stream VARCHAR(10) NULL;
    ADD COLUMN ppa VARCHAR(255) NULL;
    ADD COLUMN LGA VARCHAR(100) NULL;
    ADD COLUMN state VARCHAR(50) NULL;

    ALTER TABLE corps_members
  ADD COLUMN isSuspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN suspensionType ENUM('temporary', 'permanent') NULL,
  ADD COLUMN suspendedUntil DATETIME NULL,
  ADD COLUMN suspendedAt DATETIME NULL,
  ADD COLUMN suspensionReason TEXT NULL; 
