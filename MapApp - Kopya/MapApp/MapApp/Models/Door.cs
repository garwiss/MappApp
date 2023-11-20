using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MapApp.Models
{
    public class Door
    {
        //[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public decimal Id { get; set; }
        public string? Name {  get; set; }
        public double? X { get; set; }
        public double? Y { get; set; }

      
    }
}
