using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class StorageModelRepository : IStorageModelRepository<StorageModel>
    {
        private readonly SqlConnection _sqlConnection;

        public StorageModelRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<StorageModel>> GetAllStorageModels()
        {
            var storageModels = new List<StorageModel>();
            const string sql = "SELECT * FROM [dbo].[StorageModel]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var storageModel = new StorageModel
                {
                    id = (int)reader["Id"],
                    storageName = reader["storageName"] as string,
                    storageType = reader["storageType"] as string,
                    storageInterface = reader["storageInterface"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                storageModels.Add(storageModel);
            }
            return storageModels;
        }

        public async Task<int> CreateStorageModel(StorageModel storageModel)
        {
            var now = DateTime.UtcNow;
            storageModel.created_at = storageModel.created_at == default ? now : storageModel.created_at;
            storageModel.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[StorageModel] (storageName, storageType, storageInterface, created_at, updated_at) 
                                 VALUES (@storageName, @storageType, @storageInterface, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@storageName", storageModel.storageName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@storageType", storageModel.storageType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@storageInterface", storageModel.storageInterface ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", storageModel.created_at);
            cmd.Parameters.AddWithValue("@updated_at", storageModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateStorageModel(StorageModel storageModel, int id)
        {
            var now = DateTime.UtcNow;
            storageModel.updated_at = now;

            const string sql = @"UPDATE [dbo].[StorageModel] 
                                 SET storageName = @storageName, storageType = @storageType, 
                                     storageInterface = @storageInterface, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@storageName", storageModel.storageName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@storageType", storageModel.storageType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@storageInterface", storageModel.storageInterface ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", storageModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteStorageModel(int id)
        {
            const string sql = @"DELETE FROM [dbo].[StorageModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<StorageModel>> GetStorageModelById(int id)
        {
            var storageModels = new List<StorageModel>();
            const string sql = @"SELECT * FROM [dbo].[StorageModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var storageModel = new StorageModel
                {
                    id = (int)reader["Id"],
                    storageName = reader["storageName"] as string,
                    storageType = reader["storageType"] as string,
                    storageInterface = reader["storageInterface"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                storageModels.Add(storageModel);
            }
            return storageModels;
        }

        public async Task<bool> StorageNameExistsAsync(string storageName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[StorageModel] WHERE storageName = @storageName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@storageName", storageName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
