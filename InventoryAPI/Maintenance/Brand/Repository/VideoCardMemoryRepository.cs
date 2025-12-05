using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class VideoCardMemoryRepository : IVideoCardMemoryRepository<VideoCardMemory>
    {
        private readonly SqlConnection _sqlConnection;

        public VideoCardMemoryRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<VideoCardMemory>> GetAllVideoCardMemories()
        {
            var videoCardMemories = new List<VideoCardMemory>();
            const string sql = "SELECT * FROM [dbo].[VideoCardMemory]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var videoCardMemory = new VideoCardMemory
                {
                    id = (int)reader["Id"],
                    vRamSize = reader["vRamSize"] as string,
                    vRamType = reader["vRamType"] as string,
                    vRamBus = reader["vRamBus"] as string,
                    vRamSpeed = reader["vRamSpeed"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                videoCardMemories.Add(videoCardMemory);
            }
            return videoCardMemories;
        }

        public async Task<int> CreateVideoCardMemory(VideoCardMemory videoCardMemory)
        {
            var now = DateTime.UtcNow;
            videoCardMemory.created_at = videoCardMemory.created_at == default ? now : videoCardMemory.created_at;
            videoCardMemory.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[VideoCardMemory] (vRamSize, vRamType, vRamBus, vRamSpeed, created_at, updated_at) 
                                 VALUES (@vRamSize, @vRamType, @vRamBus, @vRamSpeed, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@vRamSize", videoCardMemory.vRamSize ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamType", videoCardMemory.vRamType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamBus", videoCardMemory.vRamBus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamSpeed", videoCardMemory.vRamSpeed ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", videoCardMemory.created_at);
            cmd.Parameters.AddWithValue("@updated_at", videoCardMemory.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateVideoCardMemory(VideoCardMemory videoCardMemory, int id)
        {
            var now = DateTime.UtcNow;
            videoCardMemory.updated_at = now;

            const string sql = @"UPDATE [dbo].[VideoCardMemory] 
                                 SET vRamSize = @vRamSize, vRamType = @vRamType, vRamBus = @vRamBus, 
                                     vRamSpeed = @vRamSpeed, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@vRamSize", videoCardMemory.vRamSize ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamType", videoCardMemory.vRamType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamBus", videoCardMemory.vRamBus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@vRamSpeed", videoCardMemory.vRamSpeed ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", videoCardMemory.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteVideoCardMemory(int id)
        {
            const string sql = @"DELETE FROM [dbo].[VideoCardMemory] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<VideoCardMemory>> GetVideoCardMemoryById(int id)
        {
            var videoCardMemories = new List<VideoCardMemory>();
            const string sql = @"SELECT * FROM [dbo].[VideoCardMemory] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var videoCardMemory = new VideoCardMemory
                {
                    id = (int)reader["Id"],
                    vRamSize = reader["vRamSize"] as string,
                    vRamType = reader["vRamType"] as string,
                    vRamBus = reader["vRamBus"] as string,
                    vRamSpeed = reader["vRamSpeed"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                videoCardMemories.Add(videoCardMemory);
            }
            return videoCardMemories;
        }

        public async Task<bool> VideoCardMemoryExistsAsync(string vRamSize)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[VideoCardMemory] WHERE vRamSize = @vRamSize;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@vRamSize", vRamSize ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
