<?php

require_once 'DB.php';

class LocationManager {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    /* ==============
    Division Management
    ================*/
    public function getAllDivisions() {
        try {
            return [
                'success' => true,
                'data' => $this->db->fetchAll("SELECT * FROM divisions ORDER BY name ASC")
            ];
        } catch (Exception $e) {
            error_log('Get divisions failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve divisions'];
        }
    }
    
    public function createDivision($name) {
        if (empty($name)) {
            return ['success' => false, 'message' => 'Division name is required'];
        }
        
        try {
            // Check if division already exists
            $existing = $this->db->fetch("SELECT id FROM divisions WHERE name = ?", [$name]);
            if ($existing) {
                return ['success' => false, 'message' => 'Division already exists'];
            }
            
            $divisionId = $this->db->insert('divisions', ['name' => $name]);
            return [
                'success' => true,
                'message' => 'Division created successfully',
                'data' => ['id' => $divisionId]
            ];
        } catch (Exception $e) {
            error_log('Create division failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create division'];
        }
    }
    
    public function updateDivision($id, $name) {
        if (empty($name)) {
            return ['success' => false, 'message' => 'Division name is required'];
        }
        
        try {
            $result = $this->db->update('divisions', ['name' => $name], ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'Division updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Division not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update division failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update division'];
        }
    }
    
    public function deleteDivision($id) {
        try {
            $result = $this->db->delete('divisions', ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'Division deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Division not found'];
            }
        } catch (Exception $e) {
            error_log('Delete division failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete division'];
        }
    }
    
    /* ==============
    District Management
    ================*/
    public function getAllDistricts($divisionId = null) {
        try {
            if ($divisionId) {
                $sql = "SELECT * FROM districts WHERE division_id = ? ORDER BY name ASC";
                $data = $this->db->fetchAll($sql, [$divisionId]);
            } else {
                $sql = "SELECT * FROM districts ORDER BY name ASC";
                $data = $this->db->fetchAll($sql);
            }
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log('Get districts failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve districts'];
        }
    }
    
    public function createDistrict($divisionId, $name) {
        if (empty($divisionId) || empty($name)) {
            return ['success' => false, 'message' => 'Division ID and district name are required'];
        }
        
        try {
            // Check if division exists
            $division = $this->db->fetch("SELECT id FROM divisions WHERE id = ?", [$divisionId]);
            if (!$division) {
                return ['success' => false, 'message' => 'Division not found'];
            }
            
            // Check if district already exists in this division
            $existing = $this->db->fetch("SELECT id FROM districts WHERE division_id = ? AND name = ?", [$divisionId, $name]);
            if ($existing) {
                return ['success' => false, 'message' => 'District already exists in this division'];
            }
            
            $districtId = $this->db->insert('districts', [
                'division_id' => $divisionId,
                'name' => $name
            ]);
            
            return [
                'success' => true,
                'message' => 'District created successfully',
                'data' => ['id' => $districtId]
            ];
        } catch (Exception $e) {
            error_log('Create district failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create district'];
        }
    }
    
    public function updateDistrict($id, $divisionId, $name) {
        if (empty($divisionId) || empty($name)) {
            return ['success' => false, 'message' => 'Division ID and district name are required'];
        }
        
        try {
            $result = $this->db->update('districts', [
                'division_id' => $divisionId,
                'name' => $name
            ], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'District updated successfully'];
            } else {
                return ['success' => false, 'message' => 'District not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update district failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update district'];
        }
    }
    
    public function deleteDistrict($id) {
        try {
            $result = $this->db->delete('districts', ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'District deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'District not found'];
            }
        } catch (Exception $e) {
            error_log('Delete district failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete district'];
        }
    }
    
    /* ==============
    Upazila Management
    ================*/
    public function getAllUpazilas($districtId = null) {
        try {
            if ($districtId) {
                $sql = "SELECT * FROM upazilas WHERE district_id = ? ORDER BY name ASC";
                $data = $this->db->fetchAll($sql, [$districtId]);
            } else {
                $sql = "SELECT * FROM upazilas ORDER BY name ASC";
                $data = $this->db->fetchAll($sql);
            }
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log('Get upazilas failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve upazilas'];
        }
    }
    
    public function createUpazila($districtId, $name) {
        if (empty($districtId) || empty($name)) {
            return ['success' => false, 'message' => 'District ID and upazila name are required'];
        }
        
        try {
            // Check if district exists
            $district = $this->db->fetch("SELECT id FROM districts WHERE id = ?", [$districtId]);
            if (!$district) {
                return ['success' => false, 'message' => 'District not found'];
            }
            
            // Check if upazila already exists in this district
            $existing = $this->db->fetch("SELECT id FROM upazilas WHERE district_id = ? AND name = ?", [$districtId, $name]);
            if ($existing) {
                return ['success' => false, 'message' => 'Upazila already exists in this district'];
            }
            
            $upazilaId = $this->db->insert('upazilas', [
                'district_id' => $districtId,
                'name' => $name
            ]);
            
            return [
                'success' => true,
                'message' => 'Upazila created successfully',
                'data' => ['id' => $upazilaId]
            ];
        } catch (Exception $e) {
            error_log('Create upazila failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create upazila'];
        }
    }
    
    public function updateUpazila($id, $districtId, $name) {
        if (empty($districtId) || empty($name)) {
            return ['success' => false, 'message' => 'District ID and upazila name are required'];
        }
        
        try {
            $result = $this->db->update('upazilas', [
                'district_id' => $districtId,
                'name' => $name
            ], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Upazila updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Upazila not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update upazila failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update upazila'];
        }
    }
    
    public function deleteUpazila($id) {
        try {
            $result = $this->db->delete('upazilas', ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'Upazila deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Upazila not found'];
            }
        } catch (Exception $e) {
            error_log('Delete upazila failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete upazila'];
        }
    }
    
    /* ==============
    Zone Management
    ================*/
    public function getAllZones($upazilaId = null) {
        try {
            if ($upazilaId) {
                $sql = "SELECT * FROM zones WHERE upazila_id = ? ORDER BY name ASC";
                $data = $this->db->fetchAll($sql, [$upazilaId]);
            } else {
                $sql = "SELECT * FROM zones ORDER BY name ASC";
                $data = $this->db->fetchAll($sql);
            }
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log('Get zones failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve zones'];
        }
    }
    
    public function createZone($upazilaId, $name) {
        if (empty($upazilaId) || empty($name)) {
            return ['success' => false, 'message' => 'Upazila ID and zone name are required'];
        }
        
        try {
            // Check if upazila exists
            $upazila = $this->db->fetch("SELECT id FROM upazilas WHERE id = ?", [$upazilaId]);
            if (!$upazila) {
                return ['success' => false, 'message' => 'Upazila not found'];
            }
            
            // Check if zone already exists in this upazila
            $existing = $this->db->fetch("SELECT id FROM zones WHERE upazila_id = ? AND name = ?", [$upazilaId, $name]);
            if ($existing) {
                return ['success' => false, 'message' => 'Zone already exists in this upazila'];
            }
            
            $zoneId = $this->db->insert('zones', [
                'upazila_id' => $upazilaId,
                'name' => $name
            ]);
            
            return [
                'success' => true,
                'message' => 'Zone created successfully',
                'data' => ['id' => $zoneId]
            ];
        } catch (Exception $e) {
            error_log('Create zone failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create zone'];
        }
    }
    
    public function updateZone($id, $upazilaId, $name) {
        if (empty($upazilaId) || empty($name)) {
            return ['success' => false, 'message' => 'Upazila ID and zone name are required'];
        }
        
        try {
            $result = $this->db->update('zones', [
                'upazila_id' => $upazilaId,
                'name' => $name
            ], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Zone updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Zone not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update zone failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update zone'];
        }
    }
    
    public function deleteZone($id) {
        try {
            $result = $this->db->delete('zones', ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'Zone deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Zone not found'];
            }
        } catch (Exception $e) {
            error_log('Delete zone failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete zone'];
        }
    }
    
    /* ==============
    Area Management
    ================*/
    public function getAllAreas($zoneId = null) {
        try {
            if ($zoneId) {
                $sql = "SELECT * FROM areas WHERE zone_id = ? ORDER BY name ASC";
                $data = $this->db->fetchAll($sql, [$zoneId]);
            } else {
                $sql = "SELECT * FROM areas ORDER BY name ASC";
                $data = $this->db->fetchAll($sql);
            }
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log('Get areas failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve areas'];
        }
    }
    
    public function createArea($zoneId, $name) {
        if (empty($zoneId) || empty($name)) {
            return ['success' => false, 'message' => 'Zone ID and area name are required'];
        }
        
        try {
            // Check if zone exists
            $zone = $this->db->fetch("SELECT id FROM zones WHERE id = ?", [$zoneId]);
            if (!$zone) {
                return ['success' => false, 'message' => 'Zone not found'];
            }
            
            // Check if area already exists in this zone
            $existing = $this->db->fetch("SELECT id FROM areas WHERE zone_id = ? AND name = ?", [$zoneId, $name]);
            if ($existing) {
                return ['success' => false, 'message' => 'Area already exists in this zone'];
            }
            
            $areaId = $this->db->insert('areas', [
                'zone_id' => $zoneId,
                'name' => $name
            ]);
            
            return [
                'success' => true,
                'message' => 'Area created successfully',
                'data' => ['id' => $areaId]
            ];
        } catch (Exception $e) {
            error_log('Create area failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create area'];
        }
    }
    
    public function updateArea($id, $zoneId, $name) {
        if (empty($zoneId) || empty($name)) {
            return ['success' => false, 'message' => 'Zone ID and area name are required'];
        }
        
        try {
            $result = $this->db->update('areas', [
                'zone_id' => $zoneId,
                'name' => $name
            ], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Area updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Area not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update area failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update area'];
        }
    }
    
    public function deleteArea($id) {
        try {
            $result = $this->db->delete('areas', ['id' => $id]);
            if ($result) {
                return ['success' => true, 'message' => 'Area deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Area not found'];
            }
        } catch (Exception $e) {
            error_log('Delete area failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete area'];
        }
    }
    
    /* ==============
    Utility Methods
    ================*/
    public function getLocationHierarchy($areaId) {
        try {
            $sql = "SELECT a.name as area_name, z.name as zone_name, u.name as upazila_name, d.name as district_name, div.name as division_name, a.id as area_id, z.id as zone_id, u.id as upazila_id, d.id as district_id, div.id as division_id FROM areas a LEFT JOIN zones z ON a.zone_id = z.id LEFT JOIN upazilas u ON z.upazila_id = u.id LEFT JOIN districts d ON u.district_id = d.id LEFT JOIN divisions div ON d.division_id = div.id WHERE a.id = ?";
            
            $data = $this->db->fetch($sql, [$areaId]);
            
            if (!$data) {
                return ['success' => false, 'message' => 'Area not found'];
            }
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log('Get location hierarchy failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve location hierarchy'];
        }
    }
    
    public function searchLocations($searchTerm, $type = 'all') {
        if (empty($searchTerm)) {
            return ['success' => false, 'message' => 'Search term is required'];
        }
        
        try {
            $results = [];
            $searchPattern = '%' . $searchTerm . '%';
            
            if ($type === 'all' || $type === 'division') {
                $divisions = $this->db->fetchAll("SELECT id, name, 'division' as type FROM divisions WHERE name LIKE ? ORDER BY name", [$searchPattern]);
                $results = array_merge($results, $divisions);
            }
            
            if ($type === 'all' || $type === 'district') {
                $districts = $this->db->fetchAll("SELECT d.id, d.name, 'district' as type, div.name as parent_name FROM districts d LEFT JOIN divisions div ON d.division_id = div.id WHERE d.name LIKE ? ORDER BY d.name", [$searchPattern]);
                $results = array_merge($results, $districts);
            }
            
            if ($type === 'all' || $type === 'upazila') {
                $upazilas = $this->db->fetchAll("SELECT u.id, u.name, 'upazila' as type, d.name as parent_name FROM upazilas u LEFT JOIN districts d ON u.district_id = d.id WHERE u.name LIKE ? ORDER BY u.name", [$searchPattern]);
                $results = array_merge($results, $upazilas);
            }
            
            if ($type === 'all' || $type === 'zone') {
                $zones = $this->db->fetchAll("SELECT z.id, z.name, 'zone' as type, u.name as parent_name FROM zones z LEFT JOIN upazilas u ON z.upazila_id = u.id WHERE z.name LIKE ? ORDER BY z.name", [$searchPattern]);
                $results = array_merge($results, $zones);
            }
            
            if ($type === 'all' || $type === 'area') {
                $areas = $this->db->fetchAll("SELECT a.id, a.name, 'area' as type, z.name as parent_name FROM areas a LEFT JOIN zones z ON a.zone_id = z.id WHERE a.name LIKE ? ORDER BY a.name", [$searchPattern]);
                $results = array_merge($results, $areas);
            }
            
            return [
                'success' => true,
                'data' => $results
            ];
        } catch (Exception $e) {
            error_log('Search locations failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to search locations'];
        }
    }
}

?>
