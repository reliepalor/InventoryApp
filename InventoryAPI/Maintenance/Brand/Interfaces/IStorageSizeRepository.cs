using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IStorageSizeRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllStorageSizes();
        Task<int> CreateStorageSize(StorageSize storageSize);
        Task<int> UpdateStorageSize(StorageSize storageSize, int id);
        Task<int> DeleteStorageSize(int id);
        Task<IEnumerable<StorageSize>> GetStorageSizeById(int id);
        Task<bool> StorageSizeExistsAsync(string size);
    }
}
