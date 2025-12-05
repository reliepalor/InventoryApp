using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class StorageSize
    {
        [Key]
        [BsonId]
        public int id { get; set; }

        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }

        [BsonElement("Size")]
        public string? Size { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
