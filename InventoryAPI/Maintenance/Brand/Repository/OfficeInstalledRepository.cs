using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class OfficeInstalledRepository : IOfficeInstalledRepository<OfficeInstalled>
    {
        private readonly SqlConnection _sqlConnection;

        public OfficeInstalledRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<OfficeInstalled>> GetAllOfficeInstalled()
        {
            var offices = new List<OfficeInstalled>();
            const string sql = "SELECT * FROM [dbo].[OfficeInstalled]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var office = new OfficeInstalled
                {
                    id = (int)reader["Id"],
                    officeName = reader["officeName"] as string,
                    officeVersion = reader["officeVersion"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                offices.Add(office);
            }
            return offices;
        }

        public async Task<int> CreateOfficeInstalled(OfficeInstalled officeInstalled)
        {
            var now = DateTime.UtcNow;
            officeInstalled.created_at = officeInstalled.created_at == default ? now : officeInstalled.created_at;
            officeInstalled.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[OfficeInstalled] (officeName, officeVersion, created_at, updated_at) 
                                 VALUES (@officeName, @officeVersion, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@officeName", officeInstalled.officeName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@officeVersion", officeInstalled.officeVersion ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", officeInstalled.created_at);
            cmd.Parameters.AddWithValue("@updated_at", officeInstalled.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateOfficeInstalled(OfficeInstalled officeInstalled, int id)
        {
            var now = DateTime.UtcNow;
            officeInstalled.updated_at = now;

            const string sql = @"UPDATE [dbo].[OfficeInstalled] 
                                 SET officeName = @officeName, officeVersion = @officeVersion, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@officeName", officeInstalled.officeName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@officeVersion", officeInstalled.officeVersion ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", officeInstalled.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteOfficeInstalled(int id)
        {
            const string sql = @"DELETE FROM [dbo].[OfficeInstalled] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<OfficeInstalled>> GetOfficeInstalledById(int id)
        {
            var offices = new List<OfficeInstalled>();
            const string sql = @"SELECT * FROM [dbo].[OfficeInstalled] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var office = new OfficeInstalled
                {
                    id = (int)reader["Id"],
                    officeName = reader["officeName"] as string,
                    officeVersion = reader["officeVersion"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                offices.Add(office);
            }
            return offices;
        }

        public async Task<bool> OfficeNameExistsAsync(string officeName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[OfficeInstalled] WHERE officeName = @officeName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@officeName", officeName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
