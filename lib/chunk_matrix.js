var voxelMesh = require('voxel-mesh');
var voxel = require('voxel');

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = ChunkMatrix;
inherits(ChunkMatrix, EventEmitter);

function ChunkMatrix (game, chunks) {
    var T = game.THREE;
    var size = game.cubeSize;
    var csize = size * game.chunkSize;
    var scale = new T.Vector3(size, size, size);
    
    var r = new T.Object3D
    var t = new T.Object3D
    var inner = new T.Object3D
    
    inner.add(r)
    t.add(inner)
    game.scene.add(t)
    
    inner.position.x = size / 2
    inner.position.z = size / 2
    
    this.rotationObject = r;
    this.translationObject = t;
    this.rotation = r.rotation;
    this.position = t.position;
    this.chunks = chunks || {};
    this.meshes = {};
    this.game = game;
    
    this._update('0|0|0');
}

ChunkMatrix.prototype.setByIndex = function (ci, vi, value) {
    var ckey = typeof ci === 'object' ? ci.join('|') : ci
    if (!this.chunks[ckey]) this.chunks[ckey] = createEmptyChunk()
    this.chunks[ckey].voxels[vi] = value
    this._update(ckey);
};

ChunkMatrix.prototype.getByIndex = function (ci, vi) {
    var ckey = typeof ci === 'object' ? ci.join('|') : ci;
    if (!this.chunks[ckey]) return undefined;
    return this.chunks[ckey].voxels[vi];
};
    
ChunkMatrix.prototype._update = function (ci) {
    var ckey = typeof ci === 'object' ? ci.join('|') : ci;
    var chunk = this.chunks[ckey];
    if (!chunk) return;
    
    var mesh = voxelMesh(chunk, voxel.meshers.greedy, scale);
    
    if (this.meshes[ckey]) {
        var s = this.meshes[ckey].surfaceMesh || this.meshes[ckey].wireMesh;
        var ix = this.meshes.indexOf(s);
        if (ix >= 0) this.meshes.splice(ix, 1);
        this.emit('remove', s.id);
        r.remove(s);
    }
    this.meshes[ckey] = mesh;
    
    if (this.game.meshType === 'wireMesh') {
        mesh.createWireMesh();
    }
    else {
        mesh.createSurfaceMesh(this.game.material);
    }
    
    var surface = mesh.surfaceMesh || mesh.wireMesh;
    surface.position.x = -size / 2;
    surface.position.z = -size / 2;
    
    var xyz = ckey.split('|');
    surface.position.x += xyz[0] * csize;
    surface.position.y += xyz[1] * csize;
    surface.position.z += xyz[2] * csize;
    
    r.add(surface);
    
    this.game._materialEngine.applyTextures(mesh.geometry);
    
    this.meshes.push(surface);
    this.emit('add', surface.id, this);
};