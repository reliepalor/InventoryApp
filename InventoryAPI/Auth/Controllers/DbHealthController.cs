using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace InventoryAPI.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbHealthController : ControllerBase
    {
        private readonly SqlConnection _sqlConnection;

        public DbHealthController(SqlConnection sqlConnection)
        {
            _sqlConnection = sqlConnection;
        }

        [HttpGet("ssms")]
        public async Task<IActionResult> CheckSqlServer()
        {
            try
            {
                await _sqlConnection.OpenAsync();
                using var cmd = _sqlConnection.CreateCommand();
                cmd.CommandText = "SELECT 1";
                var result = await cmd.ExecuteScalarAsync();
                return Ok(new { ok = true, result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ok = false, error = ex.Message });
            }
            finally
            {
                await _sqlConnection.CloseAsync();
            }
        }
    }
}
