export default interface RoomInfo {
    
    ownerId: string;
    guestId?: string;
    roomName: string;
    roomId: string;
    participants: [string, string | null];
}
