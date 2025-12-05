using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Identity.Client.Extensibility;
using System.Data;
using System.Xml.Linq;
namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class MotherboardRepository : IMotherboardRepository<Motherboard>
    {
        private readonly SqlConnection _sqlConnection;
        public MotherboardRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }
        public async Task<IEnumerable<Motherboard>> GetAllMotherboards()
        {
            var motherboards = new List<Motherboard>();
            const string sql = "SELECT * FROM [dbo].[Motherboard]";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var motherboard = new Motherboard
                {
                    id = (int)reader["Id"],
                    mbName = reader["mbName"] as string,
                    mbSocket = reader["mbSocket"] as string,
                    mbChipset = reader["mbChipset"] as string,
                    mbDescription = reader["mbDescription"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                motherboards.Add(motherboard);
            }
            return motherboards;
        }
        public async Task<int> CreateMotherboard(Motherboard motherboard)
        {
            var now = DateTime.UtcNow;
            motherboard.created_at = motherboard.created_at == default ? now : motherboard.created_at;
            motherboard.updated_at = now;
            const string sql = @"INSERT INTO [dbo].[Motherboard] (mbName, mbSocket, mbChipset, mbDescription, created_at, updated_at) VALUES (@mbName, @mbSocket, @mbChipset, @mbDescription, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@mbName", motherboard.mbName);
            cmd.Parameters.AddWithValue("@mbSocket", motherboard.mbSocket);
            cmd.Parameters.AddWithValue("@mbChipset", motherboard.mbChipset);
            cmd.Parameters.AddWithValue("@mbDescription", motherboard.mbDescription);
            cmd.Parameters.AddWithValue("@created_at", motherboard.created_at);
            cmd.Parameters.AddWithValue("@updated_at", motherboard.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }
        public async Task<int> UpdateMotherboard(Motherboard motherboard, int id)
        {
            var now = DateTime.UtcNow;
            motherboard.updated_at = now;

            const string sql = @"UPDATE [dbo].[Motherboard] SET mbName = @mbName, mbSocket = @mbSocket, mbChipset = @mbChipset, mbDescription = @mbDescription, updated_at = @updated_at WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@mbName", motherboard.mbName);
            cmd.Parameters.AddWithValue("@mbSocket", motherboard.mbSocket);
            cmd.Parameters.AddWithValue("@mbChipset", motherboard.mbChipset);
            cmd.Parameters.AddWithValue("@mbDescription", motherboard.mbDescription);
            cmd.Parameters.AddWithValue("@updated_at", motherboard.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }
        public async Task<int> DeleteMotherboard(int id)
        {
            const string sql = @"DELETE FROM [dbo].[Motherboard] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }
        public async Task<IEnumerable<Motherboard>> GetMotherboardById(int Id)
        {
            var motherboards = new List<Motherboard>();
            const string sql = @"SELECT * FROM Motherboard WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", Id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var motherboard = new Motherboard
                {
                    id = (int)reader["Id"],
                    mbName = reader["mbName"] as string,
                    mbSocket = reader["mbSocket"] as string,
                    mbChipset = reader["mbChipset"] as string,
                    mbDescription = reader["mbDescription"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                motherboards.Add(motherboard);
            }
            return motherboards;
        }
        public async Task<bool> mbNameExistsAsync(string mbName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[Motherboard] WHERE mbName = @mbName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@mbName", mbName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
