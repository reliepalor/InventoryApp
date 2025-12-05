using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class StorageSizeRepository : IStorageSizeRepository<StorageSize>
    {
        private readonly SqlConnection _sqlConnection;

        public StorageSizeRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<StorageSize>> GetAllStorageSizes()
        {
            var storageSizes = new List<StorageSize>();
            const string sql = "SELECT * FROM [dbo].[StorageSize]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var storageSize = new StorageSize
                {
                    id = (int)reader["Id"],
                    Size = reader["Size"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                storageSizes.Add(storageSize);
            }
            return storageSizes;
        }

        public async Task<int> CreateStorageSize(StorageSize storageSize)
        {
            var now = DateTime.UtcNow;
            storageSize.created_at = storageSize.created_at == default ? now : storageSize.created_at;
            storageSize.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[StorageSize] (Size, created_at, updated_at) 
                                 VALUES (@Size, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Size", storageSize.Size ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", storageSize.created_at);
            cmd.Parameters.AddWithValue("@updated_at", storageSize.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateStorageSize(StorageSize storageSize, int id)
        {
            var now = DateTime.UtcNow;
            storageSize.updated_at = now;

            const string sql = @"UPDATE [dbo].[StorageSize] 
                                 SET Size = @Size, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@Size", storageSize.Size ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", storageSize.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteStorageSize(int id)
        {
            const string sql = @"DELETE FROM [dbo].[StorageSize] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<StorageSize>> GetStorageSizeById(int id)
        {
            var storageSizes = new List<StorageSize>();
            const string sql = @"SELECT * FROM [dbo].[StorageSize] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var storageSize = new StorageSize
                {
                    id = (int)reader["Id"],
                    Size = reader["Size"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                storageSizes.Add(storageSize);
            }
            return storageSizes;
        }

        public async Task<bool> StorageSizeExistsAsync(string size)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[StorageSize] WHERE Size = @Size;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Size", size ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
