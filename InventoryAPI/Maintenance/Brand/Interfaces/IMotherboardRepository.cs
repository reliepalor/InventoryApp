using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IMotherboardRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllMotherboards();
        Task<int> CreateMotherboard(Motherboard motherboard);
        Task<int> UpdateMotherboard(Motherboard motherboard, int id);
        Task<int> DeleteMotherboard(int id);
        Task<IEnumerable<Motherboard>> GetMotherboardById(int id);

        Task<bool> mbNameExistsAsync(string mbName);

    }
}
