using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class BrandModel
    {
        [Key]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public int Id { get; set; }
        public string? referenceId { get; set; }

        [Required]
        [BsonElement("modelName")]
        public string? modelName { get; set; }

        [BsonElement("created_at")]
        public DateTime created_at { get; set; }

        [BsonElement("updated_at")]
        public DateTime updated_at { get; set; }
    }
}
