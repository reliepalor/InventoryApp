using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IVideoCardMemoryRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllVideoCardMemories();
        Task<int> CreateVideoCardMemory(VideoCardMemory videoCardMemory);
        Task<int> UpdateVideoCardMemory(VideoCardMemory videoCardMemory, int id);
        Task<int> DeleteVideoCardMemory(int id);
        Task<IEnumerable<VideoCardMemory>> GetVideoCardMemoryById(int id);
        Task<bool> VideoCardMemoryExistsAsync(string vRamSize);
    }
}
