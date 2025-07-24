namespace VisemoAlgorithm.Model
{
    public class PingLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ActivityId { get; set; }
        public int PingBatchIndex { get; set; } // e.g., 1 for first 10 emotions, 2 for second, etc.
        public bool Acknowledged { get; set; } = false;
        public DateTime PingedAt { get; set; } = DateTime.UtcNow;
    }
}
