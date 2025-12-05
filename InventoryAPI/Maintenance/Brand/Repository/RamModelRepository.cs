using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class RamModelRepository : IRamModelRepository<RamModel>
    {
        private readonly SqlConnection _sqlConnection;

        public RamModelRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<RamModel>> GetAllRamModels()
        {
            var ramModels = new List<RamModel>();
            const string sql = "SELECT * FROM [dbo].[RamModel]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var ramModel = new RamModel
                {
                    id = (int)reader["Id"],
                    rmName = reader["rmName"] as string,
                    rmType = reader["rmType"] as string,
                    rmSpeed = reader["rmSpeed"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                ramModels.Add(ramModel);
            }
            return ramModels;
        }

        public async Task<int> CreateRamModel(RamModel ramModel)
        {
            var now = DateTime.UtcNow;
            ramModel.created_at = ramModel.created_at == default ? now : ramModel.created_at;
            ramModel.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[RamModel] (rmName, rmType, rmSpeed, created_at, updated_at) 
                                 VALUES (@rmName, @rmType, @rmSpeed, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@rmName", ramModel.rmName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@rmType", ramModel.rmType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@rmSpeed", ramModel.rmSpeed ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", ramModel.created_at);
            cmd.Parameters.AddWithValue("@updated_at", ramModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateRamModel(RamModel ramModel, int id)
        {
            var now = DateTime.UtcNow;
            ramModel.updated_at = now;

            const string sql = @"UPDATE [dbo].[RamModel] 
                                 SET rmName = @rmName, rmType = @rmType, rmSpeed = @rmSpeed, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@rmName", ramModel.rmName);
            cmd.Parameters.AddWithValue("@rmType", ramModel.rmType);
            cmd.Parameters.AddWithValue("@rmSpeed", ramModel.rmSpeed);
            cmd.Parameters.AddWithValue("@updated_at", ramModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteRamModel(int id)
        {
            const string sql = @"DELETE FROM [dbo].[RamModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<RamModel>> GetRamModelById(int id)
        {
            var ramModels = new List<RamModel>();
            const string sql = @"SELECT * FROM [dbo].[RamModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var ramModel = new RamModel
                {
                    id = (int)reader["Id"],
                    rmName = reader["rmName"] as string,
                    rmType = reader["rmType"] as string,
                    rmSpeed = reader["rmSpeed"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                ramModels.Add(ramModel);
            }
            return ramModels;
        }

        public async Task<bool> RamNameExistsAsync(string rmName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[RamModel] WHERE rmName = @rmName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@rmName", rmName);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
