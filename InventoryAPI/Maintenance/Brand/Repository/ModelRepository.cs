using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using InventoryAPI.Maintenance.Brand.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using MongoDB.Driver.Core.Events;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class ModelRepository : IModelRepository<BrandModel>
    {
        private readonly SqlConnection _sqlConnection;
        public ModelRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }
        public async Task<int> CreateModel(BrandModel model)
        {
            var now = DateTime.UtcNow;
            model.created_at = model.created_at == default ? now : model.created_at;
            model.updated_at = now;

            await EnsureBrandModelTableAsync();

            const string sql = @"INSERT INTO [dbo].[Model] (modelName, created_at, updated_at)
                                 VALUES (@modelName, @created_at, @updated_at);";

            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@modelName", model.modelName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@created_at", model.created_at);
            cmd.Parameters.AddWithValue("@updated_at", model.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }

            var affected = await cmd.ExecuteNonQueryAsync();
            return affected;
        }
        public async Task<int> Update(BrandModel model, int id)
        {
            var now = DateTime.UtcNow;
            model.updated_at = now;

            const string sql = @"UPDATE [dbo].[Model]
                                 SET modelName = @modelName,
                                     updated_at = @updated_at
                                 WHERE Id = @Id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@modelName", model.modelName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@updated_at", model.updated_at);
            
            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }

            var affected = await cmd.ExecuteNonQueryAsync();
            return affected;
        }
        public async Task<int> DeleteModel(int id)
        {
            const string sql = @"DELETE FROM [dbo].[Model] WHERE Id = @Id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@Id", id);
            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }
            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }
        private async Task EnsureBrandModelTableAsync()
        {
            const string ddl = @"
            IF OBJECT_ID(N'[dbo].[Model]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Model]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [modelName] NVARCHAR(255) NULL,
                    [created_at] DATETIME2 NOT NULL,
                    [updated_at] DATETIME2 NOT NULL
                );
            END
            ELSE
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Model]') AND name = 'referenceId')
                BEGIN
                    ALTER TABLE [dbo].[Model] ADD [referenceId] NVARCHAR(50) NULL;
                END
            END";

            using var cmd = new SqlCommand(ddl, _sqlConnection);
            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<BrandModel>> GetAllBrandModels()
        {
            var models = new List<BrandModel>();
            const string sql = "SELECT Id, modelName, created_at, updated_at FROM [dbo].[Model];";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var model = new BrandModel
                {
                    Id = (int)reader["Id"],
                    modelName = reader["modelName"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"]
                };
                models.Add(model);
            }
            return models;
        }
        
        public async Task<IEnumerable<BrandModel>> GetBrandModelById(int id)
        {
            var models = new List<BrandModel>();
            const string sql = @"SELECT Id, modelName, created_at, updated_at FROM [dbo].[Model] WHERE Id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var model = new BrandModel
                {
                    Id = (int)reader["Id"],
                    modelName = reader["modelName"] as string,
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                models.Add(model);
            }
            return models;
        }
        public async Task<bool> ModelNameExistsAsync(string modelName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[Model] WHERE modelName = @modelName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@modelName", modelName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
            {
                await _sqlConnection.OpenAsync();
            }

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
