BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000),
    [firstName] NVARCHAR(1000),
    [lastName] NVARCHAR(1000),
    [phoneNumber] NVARCHAR(1000),
    [state] NVARCHAR(1000),
    [lga] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'FARMER',
    [provider] NVARCHAR(1000) NOT NULL CONSTRAINT [users_provider_df] DEFAULT 'LOCAL',
    [providerId] NVARCHAR(1000),
    [isVerified] BIT NOT NULL CONSTRAINT [users_isVerified_df] DEFAULT 0,
    [profileImage] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [lastLogin] DATETIME2,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [iconUrl] NVARCHAR(1000),
    [parentId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [categories_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [categories_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[equipment] (
    [id] NVARCHAR(1000) NOT NULL,
    [ownerId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] TEXT,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [pricePerDay] DECIMAL(10,2) NOT NULL,
    [currency] NVARCHAR(1000) NOT NULL CONSTRAINT [equipment_currency_df] DEFAULT 'NGN',
    [condition] NVARCHAR(1000) NOT NULL CONSTRAINT [equipment_condition_df] DEFAULT 'GOOD',
    [locationAddress] TEXT,
    [locationCity] NVARCHAR(1000),
    [locationState] NVARCHAR(1000),
    [locationCountry] NVARCHAR(1000) NOT NULL CONSTRAINT [equipment_locationCountry_df] DEFAULT 'Nigeria',
    [latitude] DECIMAL(10,8),
    [longitude] DECIMAL(11,8),
    [isAvailable] BIT NOT NULL CONSTRAINT [equipment_isAvailable_df] DEFAULT 1,
    [images] TEXT,
    [specifications] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [equipment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [equipment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[bookings] (
    [id] NVARCHAR(1000) NOT NULL,
    [equipmentId] NVARCHAR(1000) NOT NULL,
    [farmerId] NVARCHAR(1000) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [totalDays] INT NOT NULL,
    [pricePerDay] DECIMAL(10,2) NOT NULL,
    [totalPrice] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [bookings_status_df] DEFAULT 'PENDING',
    [paymentStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [bookings_paymentStatus_df] DEFAULT 'PENDING',
    [notes] TEXT,
    [cancellationReason] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [bookings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [confirmedAt] DATETIME2,
    [cancelledAt] DATETIME2,
    CONSTRAINT [bookings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[reviews] (
    [id] NVARCHAR(1000) NOT NULL,
    [bookingId] NVARCHAR(1000) NOT NULL,
    [equipmentId] NVARCHAR(1000) NOT NULL,
    [reviewerId] NVARCHAR(1000) NOT NULL,
    [rating] INT NOT NULL,
    [comment] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [reviews_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [reviews_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [reviews_bookingId_key] UNIQUE NONCLUSTERED ([bookingId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_email_idx] ON [dbo].[users]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_role_idx] ON [dbo].[users]([role]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_state_idx] ON [dbo].[users]([state]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [categories_name_idx] ON [dbo].[categories]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [equipment_ownerId_idx] ON [dbo].[equipment]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [equipment_categoryId_idx] ON [dbo].[equipment]([categoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [equipment_locationState_idx] ON [dbo].[equipment]([locationState]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [equipment_isAvailable_idx] ON [dbo].[equipment]([isAvailable]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [equipment_pricePerDay_idx] ON [dbo].[equipment]([pricePerDay]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_equipmentId_idx] ON [dbo].[bookings]([equipmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_farmerId_idx] ON [dbo].[bookings]([farmerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_status_idx] ON [dbo].[bookings]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_startDate_endDate_idx] ON [dbo].[bookings]([startDate], [endDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reviews_equipmentId_idx] ON [dbo].[reviews]([equipmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reviews_reviewerId_idx] ON [dbo].[reviews]([reviewerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reviews_rating_idx] ON [dbo].[reviews]([rating]);

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[equipment] ADD CONSTRAINT [equipment_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[equipment] ADD CONSTRAINT [equipment_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[bookings] ADD CONSTRAINT [bookings_equipmentId_fkey] FOREIGN KEY ([equipmentId]) REFERENCES [dbo].[equipment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[bookings] ADD CONSTRAINT [bookings_farmerId_fkey] FOREIGN KEY ([farmerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [reviews_bookingId_fkey] FOREIGN KEY ([bookingId]) REFERENCES [dbo].[bookings]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [reviews_equipmentId_fkey] FOREIGN KEY ([equipmentId]) REFERENCES [dbo].[equipment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [reviews_reviewerId_fkey] FOREIGN KEY ([reviewerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
