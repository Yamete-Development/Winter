export const discordService = {
  async getChannelName(channelId: string): Promise<string | null> {
    const token = process.env.DISCORD_TOKEN;
    if (!token) return null;

    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.name || null;
    } catch (e) {
      console.error("Failed to fetch Discord channel:", e);
      return null;
    }
  },
};
