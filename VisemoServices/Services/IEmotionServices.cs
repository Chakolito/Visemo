using VisemoServices.Model;

namespace VisemoServices.Services
{
    public interface IEmotionServices
    {

        Task<string> PredictEmotionAsync(IFormFile imageFile);
    }
}
