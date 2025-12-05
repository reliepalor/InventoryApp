using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class RamSizeRepository : IRamSizeRepository<RamSize>
    {
        private readonly SqlConnection _sqlConnection;

        public RamSizeRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<RamSize>> GetAllRamSizes()
        {
            var ramSizes = new List<RamSize>();
            const string sql = "SELECT * FROM [dbo].[RamSize]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var ramSize = new RamSize
                {
                    id = (int)reader["Id"],
                    Size = reader["Size"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                ramSizes.Add(ramSize);
            }
            return ramSizes;
        }

        public async Task<int> CreateRamSize(RamSize ramSize)
        {
            var now = DateTime.UtcNow;
            ramSize.created_at = ramSize.created_at == default ? now : ramSize.created_at;
            ramSize.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[RamSize] (Size, created_at, updated_at) 
                                 VALUES (@Size, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Size", ramSize.Size ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", ramSize.created_at);
            cmd.Parameters.AddWithValue("@updated_at", ramSize.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateRamSize(RamSize ramSize, int id)
        {
            var now = DateTime.UtcNow;
            ramSize.updated_at = now;

            const string sql = @"UPDATE [dbo].[RamSize] 
                                 SET Size = @Size, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@Size", ramSize.Size ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", ramSize.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteRamSize(int id)
        {
            const string sql = @"DELETE FROM [dbo].[RamSize] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<RamSize>> GetRamSizeById(int id)
        {
            var ramSizes = new List<RamSize>();
            const string sql = @"SELECT * FROM [dbo].[RamSize] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var ramSize = new RamSize
                {
                    id = (int)reader["Id"],
                    Size = reader["Size"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                ramSizes.Add(ramSize);
            }
            return ramSizes;
        }

        public async Task<bool> RamSizeExistsAsync(string size)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[RamSize] WHERE Size = @Size;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Size", size ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
