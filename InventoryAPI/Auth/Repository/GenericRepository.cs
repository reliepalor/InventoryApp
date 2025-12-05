using CRUDApi.Auth.Interfaces;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRUDApi.Auth.Repository
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly IMongoCollection<T> _collection;

        public GenericRepository(IMongoDatabase database, string collectionName)
        {
            _collection = database.GetCollection<T>(collectionName);
        }

        public async Task<IEnumerable<T>> GetAll()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }
         
        public async Task<T?> GetById(string id)
        {
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task Create(T entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task Update(string id, T entity)
        {
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            await _collection.ReplaceOneAsync(filter, entity);
        }

        public async Task Delete(string id)
        {
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            await _collection.DeleteOneAsync(filter);
        }
    }
}