using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InventoryAPI.Maintenance.Brand.Repository
{
    public class ProcessorRepository : IProcessorRepository<Processor>
    {
        private readonly SqlConnection _sqlConnection;

        public ProcessorRepository(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        public async Task<IEnumerable<Processor>> GetAllProcessors()
        {
            var processors = new List<Processor>();
            const string sql = "SELECT * FROM [dbo].[Processor]";
            using var cmd = new SqlCommand(sql, _sqlConnection);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var processor = new Processor
                {
                    id = (int)reader["Id"],
                    processorName = reader["processorName"] as string,
                    processorCore = reader["processorCore"] as string,
                    processorThreads = reader["processorThreads"] as string,
                    iGpu = (bool)reader["iGpu"],
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                processors.Add(processor);
            }
            return processors;
        }

        public async Task<int> CreateProcessor(Processor processor)
        {
            var now = DateTime.UtcNow;
            processor.created_at = processor.created_at == default ? now : processor.created_at;
            processor.updated_at = now;

            const string sql = @"INSERT INTO [dbo].[Processor] (processorName, processorCore, processorThreads, iGpu, created_at, updated_at) 
                                 VALUES (@processorName, @processorCore, @processorThreads, @iGpu, @created_at, @updated_at)";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@processorName", processor.processorName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@processorCore", processor.processorCore ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@processorThreads", processor.processorThreads ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@iGpu", processor.iGpu);
            cmd.Parameters.AddWithValue("@created_at", processor.created_at);
            cmd.Parameters.AddWithValue("@updated_at", processor.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var created = await cmd.ExecuteNonQueryAsync();
            return created;
        }

        public async Task<int> UpdateProcessor(Processor processor, int id)
        {
            var now = DateTime.UtcNow;
            processor.updated_at = now;

            const string sql = @"UPDATE [dbo].[Processor] 
                                 SET processorName = @processorName, processorCore = @processorCore, 
                                     processorThreads = @processorThreads, iGpu = @iGpu, updated_at = @updated_at 
                                 WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@processorName", processor.processorName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@processorCore", processor.processorCore ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@processorThreads", processor.processorThreads ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@iGpu", processor.iGpu);
            cmd.Parameters.AddWithValue("@updated_at", processor.updated_at);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var updated = await cmd.ExecuteNonQueryAsync();
            return updated;
        }

        public async Task<int> DeleteProcessor(int id)
        {
            const string sql = @"DELETE FROM [dbo].[Processor] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var deleted = await cmd.ExecuteNonQueryAsync();
            return deleted;
        }

        public async Task<IEnumerable<Processor>> GetProcessorById(int id)
        {
            var processors = new List<Processor>();
            const string sql = @"SELECT * FROM [dbo].[Processor] WHERE id = @id;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@id", id);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var processor = new Processor
                {
                    id = (int)reader["Id"],
                    processorName = reader["processorName"] as string,
                    processorCore = reader["processorCore"] as string,
                    processorThreads = reader["processorThreads"] as string,
                    iGpu = (bool)reader["iGpu"],
                    created_at = (DateTime)reader["created_at"],
                    updated_at = (DateTime)reader["updated_at"],
                };
                processors.Add(processor);
            }
            return processors;
        }

        public async Task<bool> ProcessorNameExistsAsync(string processorName)
        {
            const string sql = "SELECT COUNT(1) FROM [dbo].[Processor] WHERE processorName = @processorName;";
            using var cmd = new SqlCommand(sql, _sqlConnection);
            cmd.Parameters.AddWithValue("@processorName", processorName ?? (object)DBNull.Value);

            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
    }
}
