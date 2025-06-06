using Microsoft.AspNetCore.Mvc;
using VisemoServices.Services;

namespace VisemoServices.Controllers
{
    [Route("api/emotion")]
    [ApiController]
    public class EmotionController : ControllerBase
    {
        private readonly IEmotionServices _emotionServices;
        public EmotionController(IEmotionServices emotionServices)
        {
            _emotionServices = emotionServices;
        }

        [HttpPost("detect")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Predict(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("Image is required");

            var result = await _emotionServices.PredictEmotionAsync(image);
            return Ok(new { emotion = result });
        }
    }
}
