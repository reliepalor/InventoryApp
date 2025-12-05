using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class VideoCardModel
    {
        [Key]
        [BsonId]
        public int Id { get; set; }
        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }

        [BsonElement("videoCardName")]
        public string? videoCardName { get; set; }

        [BsonElement("videoCardChipset")]
        public string? videoCardChipset { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
