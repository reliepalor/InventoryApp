using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class VideoCardModelRepository : IVideoCardModelRepository<VideoCardModel>
    {
        private readonly SqlConnection _sqlConnection;

        public VideoCardModelRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<VideoCardModel>> GetAllVideoCardModels()
        {
            var videoCardModels = new List<VideoCardModel>();
            const string sql = "SELECT * FROM [dbo].[VideoCardModel]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var videoCardModel = new VideoCardModel
                {
                    Id = (int)reader["Id"],
                    videoCardName = reader["videoCardName"] as string,
                    videoCardChipset = reader["videoCardChipset"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                videoCardModels.Add(videoCardModel);
            }
            return videoCardModels;
        }

        public async Task<int> CreateVideoCardModel(VideoCardModel videoCardModel)
        {
            var now = DateTime.UtcNow;
            videoCardModel.created_at = videoCardModel.created_at == default ? now : videoCardModel.created_at;
            videoCardModel.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[VideoCardModel] (videoCardName, videoCardChipset, created_at, updated_at) 
                                 VALUES (@videoCardName, @videoCardChipset, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@videoCardName", videoCardModel.videoCardName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@videoCardChipset", videoCardModel.videoCardChipset ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", videoCardModel.created_at);
            cmd.Parameters.AddWithValue("@updated_at", videoCardModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateVideoCardModel(VideoCardModel videoCardModel, int id)
        {
            var now = DateTime.UtcNow;
            videoCardModel.updated_at = now;

            const string sql = @"UPDATE [dbo].[VideoCardModel] 
                                 SET videoCardName = @videoCardName, videoCardChipset = @videoCardChipset, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@videoCardName", videoCardModel.videoCardName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@videoCardChipset", videoCardModel.videoCardChipset ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", videoCardModel.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteVideoCardModel(int id)
        {
            const string sql = @"DELETE FROM [dbo].[VideoCardModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<VideoCardModel>> GetVideoCardModelById(int id)
        {
            var videoCardModels = new List<VideoCardModel>();
            const string sql = @"SELECT * FROM [dbo].[VideoCardModel] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var videoCardModel = new VideoCardModel
                {
                    Id = (int)reader["Id"],
                    videoCardName = reader["videoCardName"] as string,
                    videoCardChipset = reader["videoCardChipset"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                videoCardModels.Add(videoCardModel);
            }
            return videoCardModels;
        }

        public async Task<bool> VideoCardNameExistsAsync(string videoCardName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[VideoCardModel] WHERE videoCardName = @videoCardName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@videoCardName", videoCardName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
