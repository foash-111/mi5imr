"use client";
import { useNotificationPolling } from "@/hooks/use-notification-polling";

export default function NotificationPollingClient() {
  useNotificationPolling();
  return null;
} 