using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class OsInstalledRepository : IOsInstalledRepository<OsInstalled>
    {
        private readonly SqlConnection _sqlConnection;

        public OsInstalledRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<OsInstalled>> GetAllOsInstalled()
        {
            var osList = new List<OsInstalled>();
            const string sql = "SELECT * FROM [dbo].[OsInstalled]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var os = new OsInstalled
                {
                    id = (int)reader["Id"],
                    osName = reader["osName"] as string,
                    osVersion = reader["osVersion"] as string,
                    osType = reader["osType"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                osList.Add(os);
            }
            return osList;
        }

        public async Task<int> CreateOsInstalled(OsInstalled osInstalled)
        {
            var now = DateTime.UtcNow;
            osInstalled.created_at = osInstalled.created_at == default ? now : osInstalled.created_at;
            osInstalled.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[OsInstalled] (osName, osVersion, osType, created_at, updated_at) 
                                 VALUES (@osName, @osVersion, @osType, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@osName", osInstalled.osName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@osVersion", osInstalled.osVersion ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@osType", osInstalled.osType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", osInstalled.created_at);
            cmd.Parameters.AddWithValue("@updated_at", osInstalled.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateOsInstalled(OsInstalled osInstalled, int id)
        {
            var now = DateTime.UtcNow;
            osInstalled.updated_at = now;

            const string sql = @"UPDATE [dbo].[OsInstalled] 
                                 SET osName = @osName, osVersion = @osVersion, osType = @osType, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@osName", osInstalled.osName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@osVersion", osInstalled.osVersion ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@osType", osInstalled.osType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", osInstalled.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteOsInstalled(int id)
        {
            const string sql = @"DELETE FROM [dbo].[OsInstalled] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<OsInstalled>> GetOsInstalledById(int id)
        {
            var osList = new List<OsInstalled>();
            const string sql = @"SELECT * FROM [dbo].[OsInstalled] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var os = new OsInstalled
                {
                    id = (int)reader["Id"],
                    osName = reader["osName"] as string,
                    osVersion = reader["osVersion"] as string,
                    osType = reader["osType"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                osList.Add(os);
            }
            return osList;
        }

        public async Task<bool> OsNameExistsAsync(string osName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[OsInstalled] WHERE osName = @osName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@osName", osName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
