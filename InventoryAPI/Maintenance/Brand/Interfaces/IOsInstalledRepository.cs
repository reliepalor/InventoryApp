using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IOsInstalledRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllOsInstalled();
        Task<int> CreateOsInstalled(OsInstalled osInstalled);
        Task<int> UpdateOsInstalled(OsInstalled osInstalled, int id);
        Task<int> DeleteOsInstalled(int id);
        Task<IEnumerable<OsInstalled>> GetOsInstalledById(int id);
        Task<bool> OsNameExistsAsync(string osName);
    }
}
