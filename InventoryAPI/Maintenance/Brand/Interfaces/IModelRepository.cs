using InventoryAPI.Maintenance.Brand.Models;
namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IModelRepository<T> where T : class
    {
        Task<int> CreateModel(BrandModel model);
        Task<IEnumerable<T>> GetAllBrandModels();

        Task<int> Update(BrandModel model, int id);
        Task<IEnumerable<BrandModel>> GetBrandModelById(int id);
        Task<int> DeleteModel(int id);
        Task<bool> ModelNameExistsAsync(string modelName);

    }
}
