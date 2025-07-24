namespace VisemoAlgorithm.Dtos
{
    public class PingAcknowledgementDto
    {
        public int UserId { get; set; }
        public int ActivityId { get; set; }
        public int PingBatchIndex { get; set; }
    }
}
