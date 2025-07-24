namespace VisemoAlgorithm.Dtos
{
    public class PingCheckResultDto
    {
        public bool Pinged { get; set; }         // Should frontend show ping now?   
        public string Reason { get; set; }       // Debugging info
        public bool Acknowledged { get; set; }   // Has the user acknowledged the ping?
        public int? PingBatchIndex { get; set; }
    }
}
