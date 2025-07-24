using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace VisemoAlgorithm.Service
{
    public class EmotionDetection
    {
        private readonly HttpClient _httpClient;

        public EmotionDetection(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> DetectEmotion(IFormFile imageFile)
        {
            using var content = new MultipartFormDataContent();
            using var stream = imageFile.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png"); // or jpeg
            content.Add(fileContent, "file", imageFile.FileName);

            var response = await _httpClient.PostAsync("http://localhost:8000/predict", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var prediction = JsonDocument.Parse(json);
            return prediction.RootElement.GetProperty("emotion").ToString();
        }
    }
}

