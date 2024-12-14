/*
  Warnings:

  - Made the column `avatarUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET DEFAULT 'https://res.cloudinary.com/dehoidlo0/image/upload/v1734176820/messaging-app/r49pwufgvi6inrjc8hlj.png';
