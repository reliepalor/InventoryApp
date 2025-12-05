using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IVideoCardModelRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllVideoCardModels();
        Task<int> CreateVideoCardModel(VideoCardModel videoCardModel);
        Task<int> UpdateVideoCardModel(VideoCardModel videoCardModel, int id);
        Task<int> DeleteVideoCardModel(int id);
        Task<IEnumerable<VideoCardModel>> GetVideoCardModelById(int id);
        Task<bool> VideoCardNameExistsAsync(string videoCardName);
    }
}
