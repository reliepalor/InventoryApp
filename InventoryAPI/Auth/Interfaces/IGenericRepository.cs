namespace CRUDApi.Auth.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<T?> GetById(string id);
        Task Create(T entity);
        Task Update(string id, T entity);
        Task Delete(string id);
    }
}
