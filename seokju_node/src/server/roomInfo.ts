export default interface RoomInfo {
    
    ownerId: string;
    guestId?: string;
    roomName: string;
    roomId: string;
    status: "ready" | "playing";
    participants: [string, string | null];
}
