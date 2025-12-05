using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IOfficeInstalledRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllOfficeInstalled();
        Task<int> CreateOfficeInstalled(OfficeInstalled officeInstalled);
        Task<int> UpdateOfficeInstalled(OfficeInstalled officeInstalled, int id);
        Task<int> DeleteOfficeInstalled(int id);
        Task<IEnumerable<OfficeInstalled>> GetOfficeInstalledById(int id);
        Task<bool> OfficeNameExistsAsync(string officeName);
    }
}
