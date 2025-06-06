using System.Text.Json;
using System.Net.Http.Headers;


namespace VisemoServices.Services
{
    public class EmotionServices : IEmotionServices
    {
        private readonly HttpClient _httpClient;
 
        public EmotionServices(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> PredictEmotionAsync(IFormFile imageFile)
        {
            using var content = new MultipartFormDataContent();
            using var stream = imageFile.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png"); // Adjust if JPEG

            content.Add(fileContent, "file", imageFile.FileName);

            var response = await _httpClient.PostAsync("http://localhost:8000/predict", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            Console.WriteLine("FASTAPI RESPONSE: " + json); // or use a logger
            var prediction = JsonDocument.Parse(json);
            var emotion = prediction.RootElement.GetProperty("emotion").ToString();

            return emotion;
        }

    }
}
