using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IRamSizeRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllRamSizes();
        Task<int> CreateRamSize(RamSize ramSize);
        Task<int> UpdateRamSize(RamSize ramSize, int id);
        Task<int> DeleteRamSize(int id);
        Task<IEnumerable<RamSize>> GetRamSizeById(int id);
        Task<bool> RamSizeExistsAsync(string size);
    }
}
