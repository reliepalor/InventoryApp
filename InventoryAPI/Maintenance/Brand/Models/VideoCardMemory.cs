using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class VideoCardMemory
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [Required]
        [BsonElement("vRamSize")]
        public string? vRamSize { get; set; }

        [Required]
        [BsonElement("vRamType")]
        public string? vRamType { get; set; }
        [Required]
        [BsonElement("vRamBus")]
        public string? vRamBus { get; set; }

        [Required]
        [BsonElement("vRamSpeed")]
        public string? vRamSpeed { get; set; }

        [BsonElement("created_at")]
        public DateTime created_at { get; set; }
        [BsonElement("updated_at")]
        public DateTime updated_at { get; set; }

        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
    }
}
