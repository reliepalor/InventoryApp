using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Interfaces
{
    public interface IProcessorRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllProcessors();
        Task<int> CreateProcessor(Processor processor);
        Task<int> UpdateProcessor(Processor processor, int id);
        Task<int> DeleteProcessor(int id);
        Task<IEnumerable<Processor>> GetProcessorById(int id);
        Task<bool> ProcessorNameExistsAsync(string processorName);
    }
}
