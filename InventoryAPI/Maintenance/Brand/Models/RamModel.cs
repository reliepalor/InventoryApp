using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    public class RamModel
    {
        [Key]
        [BsonId]
        public int id { get; set; }

        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
        [Required]
        [BsonElement("rmName")]
        public string? rmName { get; set; }
        [Required]
        [BsonElement("rmType")]
        public string? rmType { get; set; }

        [Required]
        [BsonElement("rmSpeed")]
        public string? rmSpeed { get; set; }
        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}
