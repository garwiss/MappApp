using MapApp.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace MapApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static List<Door> _doorList = new List<Door>();

        public DoorController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public List<Door> GetDoors()
        {
            return _context.Doors.ToList(); 

        }

        [HttpGet("{id}")]
        public ActionResult<Door> GetDoorById(decimal id)
        {
            var door = _context.Doors.FirstOrDefault(x => x.Id == id);

            if (door == null)
            {
                return NotFound();
            }
            _context.SaveChanges();

            return door;
        }

        [HttpPost]
        public ActionResult<Door> AddDoor(Door newDoor)
        {
            _context.Doors.Add(newDoor);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetDoorById), new { id = newDoor.Id }, newDoor);
            
        }

        [HttpPut]
        public ActionResult<Door> UpdateDoor(Door door)
        {
            var existingDoor = _context.Doors.FirstOrDefault(x => x.Id == door.Id);

            if (existingDoor == null)
            {
                return NotFound();
            }

            existingDoor.Name = door.Name;
            existingDoor.X = door.X;
            existingDoor.Y = door.Y;

            _context.SaveChanges();

            return Ok(existingDoor);
        }

        [HttpDelete("{id}")]
        public ActionResult<Door> DeleteDoorById(decimal id)
        {
            //idye göre veri tabanından silme
            var door = _context.Doors.FirstOrDefault(x => x.Id == id);

            if (door == null)
            {
                return NotFound();
            }

            _context.Doors.Remove(door);
            _context.SaveChanges(); 

            return Ok(door);
        }
      
    }
}
