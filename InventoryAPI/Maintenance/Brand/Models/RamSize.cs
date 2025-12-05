using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    public class RamSize
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [Required]
        [BsonElement("Size")]
        public string? Size { get; set; } 

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
