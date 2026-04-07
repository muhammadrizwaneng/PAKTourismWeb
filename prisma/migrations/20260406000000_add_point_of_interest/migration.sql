-- CreateTable
CREATE TABLE "PointOfInterest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "gallery" TEXT,
    "category" TEXT,
    "attractionId" INTEGER,
    "destinationId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PointOfInterest_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PointOfInterest_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PointOfInterest_slug_key" ON "PointOfInterest"("slug");
