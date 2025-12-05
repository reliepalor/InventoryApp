using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IRamModelRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllRamModels();
        Task<int> CreateRamModel(RamModel ramModel);
        Task<int> UpdateRamModel(RamModel ramModel, int id);
        Task<int> DeleteRamModel(int id);
        Task<IEnumerable<RamModel>> GetRamModelById(int id);
        Task<bool> RamNameExistsAsync(string rmName);
    }
}
