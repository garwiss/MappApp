

using Microsoft.EntityFrameworkCore;

namespace MapApp.Models
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
       
        {
                
        }

        //Doors olan yer tablo adı olursa daha uygun olur
        public DbSet<Door> Doors { get; set; }
    }
}
