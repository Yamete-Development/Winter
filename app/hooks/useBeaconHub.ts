import { useEffect, useState, useRef } from "react";
import { Socket, Channel } from "phoenix";

export function useBeaconHub(hubId: string | null, subTopic: "messages" | "config" | "analytics") {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!hubId) return;

    let mounted = true;
    let currentChannel: Channel | null = null;
    const beaconUrl = import.meta.env.VITE_BEACON_URL || "ws://localhost:4001/socket";

    const connectAndJoin = async () => {
      try {
        // Fetch fresh token
        const resp = await fetch("/api/beacon/token", { method: "POST" });
        if (!resp.ok) throw new Error("Failed to fetch beacon token");
        const { token } = await resp.json();

        if (!mounted) return;

        // Initialize socket
        const socket = new Socket(beaconUrl, { params: { token } });
        socket.connect();
        socketRef.current = socket;

        // On token expiry/socket close, let Phoenix reconnect automatically,
        // but Phoenix's default behavior won't refresh the token natively.
        // We handle token refresh by listening to errors.
        socket.onError(async () => {
          console.warn("Beacon socket error, attempting token refresh...");
          socket.disconnect();
          
          if (mounted) {
            // Wait briefly then try to reconnect with fresh token
            setTimeout(connectAndJoin, 2000);
          }
        });

        // Join channel
        const topic = `hub:${hubId}:${subTopic}`;
        currentChannel = socket.channel(topic, {});

        currentChannel.join()
          .receive("ok", () => {
            if (mounted) {
              setIsConnected(true);
              setError(null);
            }
          })
          .receive("error", ({ reason }) => {
            if (mounted) {
              setError(`Failed to join ${topic}: ${reason}`);
              setIsConnected(false);
            }
          });

        if (mounted) setChannel(currentChannel);

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsConnected(false);
        }
      }
    };

    connectAndJoin();

    return () => {
      mounted = false;
      if (currentChannel) currentChannel.leave();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [hubId, subTopic]);

  return { channel, isConnected, error };
}
