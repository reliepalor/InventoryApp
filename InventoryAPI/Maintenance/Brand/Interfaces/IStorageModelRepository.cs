using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IStorageModelRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllStorageModels();
        Task<int> CreateStorageModel(StorageModel storageModel);
        Task<int> UpdateStorageModel(StorageModel storageModel, int id);
        Task<int> DeleteStorageModel(int id);
        Task<IEnumerable<StorageModel>> GetStorageModelById(int id);
        Task<bool> StorageNameExistsAsync(string storageName);
    }
}
